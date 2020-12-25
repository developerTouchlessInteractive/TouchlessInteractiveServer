import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LogService } from '../../logger/logger.service';
import { Controller, Get, Req, Body, Redirect, Res, Param, Post } from '@nestjs/common';
import { Request, Response } from "express";
import { FlowbossService } from '../../flowboss/flowboss.service';
import { FlowdbService } from '../flowdb/flowdb.service';
import { TiCodes, Message } from '../flow.model';
import { SessiondbService } from '../sessiondb/sessiondb.service';
import { Register, RegisterByCode } from '../api.swagger';

@ApiTags('register')
@Controller('register')
export class RegisterController {
    private readonly TAG = "RegisterController"

    constructor(private logger: LogService,
        private flowboss: FlowbossService,
        private sessionServ: SessiondbService,
        private flowDbServ: FlowdbService) { }

    /**
     * register customer 
     */
    @Post('customer')
    @ApiResponse({ status: TiCodes.REGISTRATION_SUCCESS, description: Message.REGISTRATION_SUCCESS })
    @ApiResponse({ status: TiCodes.REGISTRATION_FAILURE, description: Message.REGISTRATION_FAILURE })
    async registerCustomer(@Body() req: Register, @Res() res: Response) {
        this.logger.log('new customer registration request')
        const sessionId = req.sessionId
        const flowId = req.flowId
        const customer = req.customer
        const registerData = {
            sessionId: sessionId,
            flowId: flowId,
            customerChannel: customer
        }
        this.logger.logm('registration:request:session-id', sessionId)
        try {
            const session = await this.flowboss.getSession(sessionId)

            if (session) {
                session.registerCustomer(registerData)
                const flow = await this.flowDbServ.getTotalById(flowId)
                if (flow) {
                    res.send({
                        flow: flow,
                        flowState: session.triggerHandler.getFlowState() ? session.triggerHandler.getFlowState() : undefined,
                        sessionId: session.sessionId,
                        customerChannel: session.customerChannel,
                        message: Message.REGISTRATION_SUCCESS,
                        code: TiCodes.REGISTRATION_SUCCESS
                    })
                } else {
                    res.send({
                        code: TiCodes.REGISTRATION_FAILURE,
                        message: Message.REGISTRATION_FAILURE
                    })
                }
            } else {
                res.send({
                    code: TiCodes.REGISTRATION_FAILURE,
                    message: Message.REGISTRATION_FAILURE
                })
            }
        } catch (error) {
            this.logger.logm('error registering', error)
            res.send({
                code: TiCodes.REGISTRATION_FAILURE,
                message: Message.REGISTRATION_FAILURE
            })
        }
    }

    /**
     * register customer request by invite code 
     */
    @Post('customerByCode')
    @ApiResponse({ status: TiCodes.REGISTRATION_SUCCESS, description: Message.REGISTRATION_SUCCESS })
    @ApiResponse({ status: TiCodes.REGISTRATION_FAILURE, description: Message.REGISTRATION_FAILURE })
    async registerCustomerByCode(@Body() req: RegisterByCode, @Res() res: Response) {
        try {
            const inviteCode = req.inviteCode
            const sessionStruct = await this.sessionServ.getByInviteCode(inviteCode)
            const flowSession = sessionStruct.flowSession

            const registerData = {
                sessionId: flowSession.sessionId,
                flowId: flowSession.flowId,
                customerChannel: flowSession.customerChannel
            }

            this.logger.logm('registration:request:session-id', registerData.sessionId)
            const session = await this.flowboss.getSession(registerData.sessionId)
            if (session) {
                session.registerCustomer(registerData)
                const flowDetails = await this.flowDbServ.getTotalById(registerData.flowId)
                if (flowDetails) {
                    res.send({
                        flow: flowDetails,
                        flowState: session.triggerHandler.getFlowState() ? session.triggerHandler.getFlowState() : undefined,
                        sessionId: session.sessionId,
                        customerChannel: session.customerChannel,
                        message: Message.REGISTRATION_SUCCESS,
                        code: TiCodes.REGISTRATION_SUCCESS
                    })
                } else {
                    res.send({
                        code: TiCodes.REGISTRATION_FAILURE,
                        message: Message.REGISTRATION_FAILURE
                    })
                }
            } else {
                res.send({
                    code: TiCodes.REGISTRATION_FAILURE,
                    message: Message.REGISTRATION_FAILURE
                })
            }
        } catch (error) {
            this.logger.logm('error registering', error)
            res.send({
                code: TiCodes.REGISTRATION_FAILURE,
                message: Message.REGISTRATION_FAILURE
            })
        }
    }
}
