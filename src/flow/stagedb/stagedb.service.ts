import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StageStructure } from '../stagestructure.model';
import { LogService } from '../../logger/logger.service';
import { TaskdbService } from '../taskdb/taskdb.service';

@Injectable()
export class StagedbService {
    constructor(@InjectModel('Stage') private readonly stagemodel: Model<StageStructure>,
        private logserv: LogService, private taskDbServ: TaskdbService) { }

    async save(stage) {
        try {
            const fl = new this.stagemodel(stage)
            return fl.save()
        } catch (error) {
            this.logserv.logm(`error saving stage`, error)
        }
    }

    async getById(id: string): Promise<StageStructure> {
        try {
            var stage: StageStructure = await this.stagemodel.findById(id)
            return stage
        } catch (error) {
            this.logserv.logm('cant find stage', error)
        }
    }

    async getTotalById(id: string) {
        try {
            var stage = await this.getById(id)
            if (stage != null) {
                const tasks = await this.getTasksForStage(stage.tasks) //tasks for each stage
                this.logserv.logm('stages', tasks)
                const result = { ...stage.toJSON(), tasks }
                return result
            }
        } catch (error) {
            console.log('cant find docs')
        }
    }


    private getTasksForStage(tasklist) {
        return new Promise((resolve, reject) => {
            const tasks = []
            tasklist.forEach(async (taskid, index) => {
                tasks.push(await this.taskDbServ.getById(taskid))
                if (index === tasklist.length - 1) resolve(tasks)
            });
        })
    }


    async getAll(): Promise<StageStructure[]> {
        try {
            return await this.stagemodel.find()
        } catch (error) {
            this.logserv.logm('cant find stages', error)
        }
    }

    async deleteById(id: string) {
        try {
            var stage = await this.stagemodel.deleteOne({ _id: id })
            return stage
        } catch (error) {
            this.logserv.logm('cant find stage', error)
        }
    }

    async validateStage(stage) {
        const name_query = { name: stage.name }
        const name_result = await this.stagemodel.findOne(name_query)
        if (name_result) {
            return name_result
        }
        const inputTasks = stage.tasks
        const config_query = { tasks: { $eq: inputTasks }, canSkip: stage.canSkip, hostConsentToProceed: stage.hostConsentToProceed }
        const result = await this.stagemodel.findOne(config_query)

        this.logserv.logm('query result', result)
        return result
    }

    /**
    * check if this task is used by any stage
    * if no stage is using it then no flow is using it.
    * @param id task id
    */
    async anyTaskUsers(id) {
        const stages = await this.anyStageHasTask(id)
        this.logserv.logm('stages with task_id:' + id, stages)
        return stages
    }

    async anyStageHasTask(id) {
        try {
            const delete_query = { tasks: { $elemMatch: { $eq: id } } }
            const result = await this.stagemodel.find(delete_query)

            this.logserv.logm('query result', result)
            return result

        } catch (error) {
            this.logserv.logm('error query: ', error)
            return []
        }
    }
}
