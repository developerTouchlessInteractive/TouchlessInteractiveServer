import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FlowStructure } from '../flowstructure.model';
import { LogService } from '../../logger/logger.service';
import { StagedbService } from '../stagedb/stagedb.service';
import { TaskdbService } from '../taskdb/taskdb.service';

@Injectable()
export class FlowdbService {
    private readonly TAG = "FlowDbService"
    constructor(@InjectModel('Flow') private readonly flowmodel: Model<FlowStructure>,
        private logserv: LogService,
        private stagedbServ: StagedbService,
        private taskdbServ: TaskdbService) {
        logserv.setContext(this.TAG)
    }

    async save(flow) {
        try {
            const fl = new this.flowmodel(flow)
            return fl.save()
        } catch (error) {
            console.log(`error saving flow ${error}`)
        }
    }

    async getById(id: string): Promise<FlowStructure> {
        try {
            var flow: FlowStructure = await this.flowmodel.findById(id)
            return flow
        } catch (error) {
            console.log('cant find docs')
        }
    }

    async getTotalById(id: string) {
        try {
            var flow = await this.getById(id)
            if (flow != null) {

                const stages = await this.getStagesForFlow(flow)
                const result = { ...flow.toJSON(), stages }
                this.logserv.logm('result: api call for flow total', result)
                return result
            }
        } catch (error) {
            console.log('cant find docs')
        }
    }

    private getStagesForFlow(flow: FlowStructure) {
        return new Promise((resolve, reject) => {
            const stages = []
            flow.stages.forEach(async (stageid, index) => {
                const stag = await (await this.stagedbServ.getById(stageid))
                const result = stag.toJSON()
                stages.push(result);
                if (index === flow.stages.length - 1) resolve(stages)
            })
        })
    }

    private getTasksForStage(tasklist) {
        return new Promise((resolve, reject) => {
            const tasks = []
            tasklist.forEach(async (taskid, index) => {
                const tsk = await (await this.taskdbServ.getById(taskid))
                tasks.push(tsk.toJSON())
                if (index === tasklist.length - 1) resolve(tasks)
            });
        })
    }

    async getTaskById(taskId) {
        return (await this.taskdbServ.getById(taskId)).toJSON()
    }

    async getAll(): Promise<FlowStructure[]> {
        try {
            return await this.flowmodel.find()
        } catch (error) {
            this.logserv.logm('cant find flows', error)
        }
    }

    async deleteById(id: string) {
        try {
            var flow = await this.flowmodel.deleteOne({ _id: id })
            return flow
        } catch (error) {
            this.logserv.logm('cant find flow', error)
        }
    }

    /**
     * validate if an identical flow exist's before creating one 
     * @param flow  flow which is to be validated
     * @returns Promise<FlowStructure> query result
     */
    async validateFlow(flow): Promise<FlowStructure> {
        const name_query = { name: flow.name }
        const name_result = await this.flowmodel.findOne(name_query)
        if (name_result) {
            return name_result
        }
        const inputStages = flow.stages
        const config_query = { stages: { $eq: inputStages }, hostCanAbort: flow.hostCanAbort }
        const result = await this.flowmodel.findOne(config_query)

        this.logserv.logm('query result', result)
        return result
    }

    /**
    * check if this stage is used by any flow
    * @param id stage id
    */
    async anyStageUsers(id) {
        const flows = await this.anyFlowHasStage(id)
        this.logserv.logm('flows with stage_id:' + id, flows)
        return flows
    }

    async anyFlowHasStage(id) {
        try {
            const delete_query = { stages: { $elemMatch: { $eq: id } } }
            const result = await this.flowmodel.find(delete_query)

            this.logserv.logm('query result', result)
            return result

        } catch (error) {
            this.logserv.logm('error query: ', error)
            return []
        }
    }
}
