import { Controller, Get, Post, Req, Res, Body, Param } from '@nestjs/common';
import { StagedbService } from '../stagedb/stagedb.service';
import { LogService } from '../../logger/logger.service';
import * as shortid from 'shortid'
import * as moment from 'moment'
import { Message, TiCodes } from '../flow.model';
import { ApiTags, ApiResponse, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { FlowdbService } from '../flowdb/flowdb.service';
import { Stage } from '../api.swagger';

@ApiTags('stage')
@Controller('stage')
export class StageController {

    constructor(private stageDbServ: StagedbService,
        private logger: LogService,
        private flowDbServ: FlowdbService) { }

    @Post()
    @ApiResponse({ status: TiCodes.SUCCESS_STAGE_CREATION, description: Message.SUCCESS_STAGE_CREATION })
    @ApiResponse({ status: TiCodes.FAILURE_STAGE_CREATION, description: Message.FAILURE_STAGE_CREATION })
    @ApiResponse({ status: TiCodes.CREATION_FAILURE_STAGE_CONFIG_EXISTS, description: Message.CREATION_FAILURE_STAGE_CONFIG_EXISTS })
    async create(@Body() stage: Stage, @Res() res) {
        try {
            const validateStage = await this.stageDbServ.validateStage(stage)
            if (validateStage === null) {
                stage._id = shortid.generate()
                stage.createdDate = moment().format('MMM Do YYYY hh:mm a')
                const result = await this.stageDbServ.save(stage)
                res.send({ code: 200, message: Message.SUCCESS_STAGE_CREATION, id: result._id })
            } else {
                const vStage = { _id: validateStage._id, name: validateStage.name }
                res.send({ code: 404, message: Message.CREATION_FAILURE_STAGE_CONFIG_EXISTS, result: vStage })
            }
        } catch (error) {
            res.send({ code: 400, message: Message.FAILURE_STAGE_CREATION })
        }
    }

    @Get('all')
    async findAll(@Res() response) {
        const stages = await this.stageDbServ.getAll()

        response.send({ 'stages': stages })
    }

    @Get(':id')
    async findStageById(@Param() params, @Res() response) {
        const stage = await this.stageDbServ.getById(params.id)
        if (stage) {
            response.send({ 'stage': stage })
        } else {
            response.send({ code: 490, message: Message.NO_STAGE_FOUND })
        }
    }

    @Get('total/:id')
    @ApiOkResponse({ description: 'provides total stage definition if stage exist' })
    @ApiNoContentResponse({ description: 'no stage with the id' })
    async getTotalStageById(@Param() params, @Res() response) {
        const flow = await this.stageDbServ.getTotalById(params.id)
        response.send({ 'flow': flow })
    }

    @Post('delete')
    async deleteOne(@Body() stage, @Res() res) {
        try {
            const stageUsers = await this.flowDbServ.anyFlowHasStage(stage.id)
            if (stageUsers.length > 0) {
                res.send({ code: 501, message: Message.DELETE_STAGE_FLOWS_USERS_EXIST, flows: stageUsers })
            } else {
                const result = await this.stageDbServ.deleteById(stage.id)
                if (result.deletedCount === 0) {
                    res.send({ code: 404, message: Message.DELETE_STAGE_DOESNT_EXIST })
                } else {
                    res.send({ code: 200, message: Message.SUCCESS_STAGE_DELETED, result: JSON.stringify(result) })
                }
            }

        } catch (error) {
            res.status({ code: 400, message: Message.FAILURE_STAGE_DELETION })
        }
    }
}
