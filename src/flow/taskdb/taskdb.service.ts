import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskStructure } from '../taskstructure.model';
import { StagedbService } from '../stagedb/stagedb.service';
import { LogService } from '../../logger/logger.service';

@Injectable()
export class TaskdbService {
    constructor(@InjectModel('Task') private readonly taskmodel: Model<TaskStructure>,
        private logServ: LogService) { }

    async save(task) {
        try {
            const tsk = new this.taskmodel(task)
            return tsk.save()
        } catch (error) {
            console.log(`error saving task ${error}`)
        }
    }

    async getById(id: string): Promise<TaskStructure> {
        try {
            var task: TaskStructure = await this.taskmodel.findById(id).lean()
            return task
        } catch (error) {
            console.log('cant find docs')
        }
    }

    async getAll(): Promise<TaskStructure[]> {
        try {
            return await this.taskmodel.find()
        } catch (error) {
            console.log('cant find tasks')
        }
    }

    async deleteById(id: string) {
        try {
            var task = await this.taskmodel.deleteOne({ _id: id })
            return task
        } catch (error) {
            console.log('cant find tasks')
        }
    }

    /**
     * check if there is a task with this task config
     * @param task task to be validated
     */
    async validateTask(task) {
        const query = { userAction: task.userAction, userInput: task.userInput, resource: task.resource, type: task.type }
        var task1: TaskStructure = await this.taskmodel.findOne(query)
        return task1
    }
}
