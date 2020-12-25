import { Controller, Get, Post, Res, Body, Param } from '@nestjs/common';
import { TaskdbService } from '../taskdb/taskdb.service';
import { LogService } from '../../logger/logger.service';
import { Message, TiCodes } from '../flow.model';
import * as shortid from 'shortid'
import * as moment from 'moment'
import { ApiTags, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { StagedbService } from '../stagedb/stagedb.service';
import { Task } from '../api.swagger';

@ApiTags('task')
@Controller('task')
export class TaskController {

    constructor(private taskDbServ: TaskdbService,
        private logger: LogService,
        private stageDbServ: StagedbService) { }

    @Post()
    @ApiResponse({ status: TiCodes.SUCCESS_TASK_CREATION, description: Message.SUCCESS_TASK_CREATION })
    @ApiResponse({ status: TiCodes.FAILURE_TASK_CREATION, description: Message.FAILURE_TASK_CREATION })
    @ApiResponse({ status: TiCodes.CREATION_FAILURE_TASK_CONFIG_EXISTS, description: Message.CREATION_FAILURE_TASK_CONFIG_EXISTS })
    async create(@Body() task: Task, @Res() res) {
        try {
            const validateTask = await this.taskDbServ.validateTask(task)
            if (validateTask === null) {
                if (!task._id) task._id = shortid.generate()
                if (!task.createdDate) task.createdDate = moment().format('MMM Do YYYY hh:mm a')
                const result = await this.taskDbServ.save(task)
                this.logger.logm("task created", result)
                res.send({ code: TiCodes.SUCCESS_TASK_CREATION, message: Message.SUCCESS_TASK_CREATION, id: result._id })
            } else {
                const vTask = { _id: validateTask._id, name: validateTask.name }
                res.send({ code: TiCodes.CREATION_FAILURE_TASK_CONFIG_EXISTS, message: Message.CREATION_FAILURE_TASK_CONFIG_EXISTS, result: vTask })
            }
        } catch (error) {
            res.send({ code: TiCodes.FAILURE_TASK_CREATION, message: Message.FAILURE_TASK_CREATION })
        }
    }

    @Get('all')
    async findAll(@Res() response) {
        const tasks = await this.taskDbServ.getAll()
        response.send({ 'tasks': tasks })
    }

    @Get(':id')
    async findTaskById(@Param() params, @Res() response) {
        const tasks = await this.taskDbServ.getById(params.id)
        response.send({ 'tasks': tasks })
    }

    @Post('delete')
    async deleteOne(@Body() task, @Res() res) {
        try {
            const taskUsers = await this.stageDbServ.anyTaskUsers(task.id)
            if (taskUsers.length > 0) {
                res.send({ code: TiCodes.DELETE_TASK_STAGES_USERS_EXIST, message: Message.DELETE_TASK_STAGES_USERS_EXIST, stages: taskUsers })
            } else {
                const result = await this.taskDbServ.deleteById(task.id)
                if (result.deletedCount === 0) {
                    res.send({ code: TiCodes.DELETE_TASK_DOESNT_EXIST, message: Message.DELETE_TASK_DOESNT_EXIST })
                } else {
                    res.send({ code: TiCodes.SUCCESS_TASK_DELETED, message: Message.SUCCESS_TASK_DELETED, result: JSON.stringify(result) })
                }
            }
        } catch (error) {
            res.send({ code: TiCodes.FAILURE_TASK_CREATION, message: Message.FAILURE_TASK_CREATION })
        }
    }
}
