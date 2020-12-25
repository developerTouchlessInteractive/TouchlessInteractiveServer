import { Controller, Get, Post, Req, Res, Body, Param } from '@nestjs/common';
import { LogService } from '../../logger/logger.service';
import * as shortid from 'shortid'
import * as moment from 'moment'
import { TiCodes, Message } from '../flow.model';
import { FlowdbService } from '../flowdb/flowdb.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from "express";
import { FlowbossService } from '../../flowboss/flowboss.service';
import { FlowManager } from '../../flowmanager';
import { SessiondbService } from '../sessiondb/sessiondb.service';
import { FlowserverGateway } from '../flowserver.gateway';
import { InteractiveGateway } from '../../interactive/interactive.gateway';
import { Flow, FlowIdParam, InitiateFlow, SessionInfo } from '../api.swagger';

@ApiTags('flow')
@Controller('flow')
export class FlowController {
    private readonly TAG = "FlowController"
    constructor(private flowDb: FlowdbService,
        private logger: LogService,
        private flowBoss: FlowbossService,
        private flowSessionDb: SessiondbService,
        private flowSocket: FlowserverGateway,
        private interactSocket: InteractiveGateway) {
        this.logger.setContext(this.TAG)
    }

    @Post()
    @ApiResponse({ status: TiCodes.SUCCESS_FLOW_CREATION, description: Message.SUCCESS_FLOW_CREATION })
    @ApiResponse({ status: TiCodes.FAILURE_FLOW_CREATION, description: Message.FAILURE_FLOW_CREATION })
    @ApiResponse({ status: TiCodes.CREATION_FAILURE_FLOW_CONFIG_EXISTS, description: Message.CREATION_FAILURE_FLOW_CONFIG_EXISTS })
    async create(@Body() flow: Flow, @Res() res) {
        try {
            const validateFlow = await this.flowDb.validateFlow(flow)
            if (validateFlow === null) {
                flow._id = shortid.generate()
                flow.createdDate = moment().format('MMM Do YYYY hh:mm a')
                const result = await this.flowDb.save(flow)
                res.send({ code: TiCodes.SUCCESS_FLOW_CREATION, message: Message.SUCCESS_FLOW_CREATION, id: result._id })
            } else {
                const vFlow = { _id: validateFlow._id, name: validateFlow.name }
                res.send({ code: TiCodes.FAILURE_FLOW_CREATION, message: Message.CREATION_FAILURE_FLOW_CONFIG_EXISTS, result: vFlow })
            }
        } catch (error) {
            res.send({ code: TiCodes.FAILURE_FLOW_CREATION, message: Message.FAILURE_FLOW_CREATION })
        }
    }

    @Get('all')
    async findAll(@Res() response) {
        const flows = await this.flowDb.getAll()
        response.send(flows)
    }

    @Get('byid/:id')
    @ApiResponse({ status: TiCodes.NO_FLOW_FOUND, description: Message.NO_FLOW_FOUND })
    async findFlowById(@Param() params, @Res() response) {
        const flow = await this.flowDb.getById(params.id)
        if (flow) {
            response.send(flow)
        } else {
            response.send({ code: TiCodes.NO_FLOW_FOUND, message: Message.NO_FLOW_FOUND })
        }
    }

    @Get('total/:id')
    @ApiResponse({ status: TiCodes.NO_FLOW_FOUND, description: Message.NO_FLOW_FOUND })
    async getTotalFlowById(@Param() params: FlowIdParam, @Res() response) {
        const flow = await this.flowDb.getTotalById(params.id)
        if (flow) {
            response.send(flow)
        } else {
            response.send({ code: TiCodes.NO_FLOW_FOUND, message: Message.NO_FLOW_FOUND })
        }
    }


    @Post('delete')
    @ApiResponse({ status: TiCodes.SUCCESS_FLOW_DELETED, description: Message.SUCCESS_FLOW_DELETED })
    @ApiResponse({ status: TiCodes.NO_FLOW_FOUND, description: Message.DELETE_FLOW_DOESNT_EXIST })
    @ApiResponse({ status: TiCodes.FAILURE_FLOW_DELETION, description: Message.FAILURE_FLOW_DELETION })
    async deleteOne(@Body() flow, @Res() res) {
        try {
            const result = await this.flowDb.deleteById(flow.id)
            if (result.deletedCount === 0) {
                res.send({ code: TiCodes.NO_FLOW_FOUND, message: Message.DELETE_FLOW_DOESNT_EXIST })
            } else {
                res.send({ code: TiCodes.SUCCESS_FLOW_DELETED, message: Message.SUCCESS_FLOW_DELETED, result: JSON.stringify(result) })
            }
        } catch (error) {
            res.status({ code: TiCodes.FAILURE_FLOW_DELETION, message: Message.FAILURE_FLOW_DELETION })
        }
    }

    @Post('initiate')
    @ApiResponse({ status: TiCodes.SUCCESS_FLOW_INITIATED, description: Message.FLOW_INITIATION_SUCCESS })
    @ApiResponse({ status: TiCodes.FAILURE_FLOW_INTIATION, description: Message.FLOW_INITIATION_FAILURE })
    async initiateFlow(@Body() req: InitiateFlow, @Res() res: Response) {
        try {
            const flowId = req.flowId
            const flowDetail = await this.flowDb.getTotalById(flowId)

            const flowManager = new FlowManager(flowDetail, this.flowDb, this.logger, this.flowSocket, this.interactSocket, this.flowSessionDb)
            this.flowBoss.registerSession(flowManager)
            const inviteCode = await this.flowSessionDb.getInviteCode()

            const intiateResponse: SessionInfo = {
                sessionId: flowManager.sessionId,
                channelId: flowManager.clientChannel,
                inviteCode: inviteCode
            }

            const flowManagerData = {
                sessionId: flowManager.sessionId,
                customerChannel: flowManager.customerChannel,
                clientChannel: flowManager.clientChannel,
                flowId: flowId
            }
            const data = {
                flowSession: flowManagerData,
                inviteCode: inviteCode,
                _id: flowManagerData.sessionId
            }
            flowManager.inviteCode = inviteCode
            const saveSession = await this.flowSessionDb.saveSession(data)
            this.logger.logm(`is save succesful`, saveSession)

            this.logger.logm('sending response to client', intiateResponse)
            res.send(intiateResponse)
        } catch (error) {
            this.logger.log('error with initiate flow')
            res.send({ code: TiCodes.FAILURE_FLOW_INTIATION, message: Message.FLOW_INITIATION_FAILURE })
        }
    }

    @Post('finish')
    async finishFlow(@Req() req: Request, @Res() res: Response) {
        try {
            const sessionId = req.body.sessionId
            const finishResponse = {}

            if (await this.flowBoss.isSessionLive(sessionId)) {
                await this.flowBoss.endSession(sessionId)
                finishResponse['isComplete'] = true
            } else {
                finishResponse['isComplete'] = false
            }
            this.logger.logm('sending finish flow response to client', finishResponse)
            res.send(finishResponse)
        } catch (error) {
            this.logger.log('error with finishing flow')
            res.send({ code: TiCodes.FAILURE_FLOW_FINISH, message: Message.FLOW_COMPLETION_FAILURE })
        }
    }
}
