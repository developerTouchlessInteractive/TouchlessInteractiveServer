import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogService } from '../../logger/logger.service';
import { SessionStructure } from '../sessionstructure.model';
import cryptoRandomString = require('crypto-random-string');
import { CommunicationData, FlowState, ResponseData } from 'ezsign-client';
import * as _ from 'lodash'

@Injectable()
export class SessiondbService {
    constructor(@InjectModel('FlowSession') private readonly flowsessionmodel: Model<SessionStructure>,
        private logserv: LogService) { }

    async saveSession(flowman) {
        try {
            const fl = new this.flowsessionmodel(flowman)
            return fl.save()
        } catch (error) {
            console.log(`error saving flow ${error}`)
        }
    }

    async getByInviteCode(code: string): Promise<SessionStructure> {
        try {
            const code_query = { inviteCode: code };
            const code_result = await this.flowsessionmodel.findOne(code_query);
            if (!code_result || code_result === null) throw new Error("unable to find flow session for invitecode");

            return code_result;
        } catch (error) {
            console.log('cant find session')
        }
    }


    async getInviteCode() {
        let invitecode = cryptoRandomString({ length: 4 })
        let code_result = await this.codeExist(invitecode);
        while (code_result) {
            invitecode = cryptoRandomString({ length: 4 })
            code_result = await this.codeExist(invitecode)
        }
        console.log(`invite code is ${invitecode}`)
        return invitecode
    }

    private async codeExist(invitecode: string) {
        const code_query = { inviteCode: invitecode };
        const code_result = await this.flowsessionmodel.findOne(code_query);
        return code_result;
    }


    async updateEventBook(sessionId: string, event: ResponseData) {
        try {
            var session = await this.flowsessionmodel.findById({ _id: sessionId })
            if (!session) return "no session found"
            try {
                session.eventBook.push(event)
            } catch (error) {
                this.logserv.logm('error in db', error)
            }

            return (await session.save())._id
        } catch (error) {
            return (JSON.stringify(error))
        }
    }

    async updateInteractBook(sessionId: string, code: string, event: CommunicationData) {
        try {
            const code_query = { inviteCode: code, _id: sessionId };
            const session = await this.flowsessionmodel.findOne(code_query);

            // var session = await this.flowsessionmodel.findById({ })
            if (!session) return "no session found"
            try {
                session.interactBook.push(event)
            } catch (error) {
                this.logserv.logm('error in db', error)
            }

            return (await session.save())._id
        } catch (error) {
            return (JSON.stringify(error))
        }
    }

    async updateStateBook(sessionId: string, state: any) {

        try {
            var session = await this.flowsessionmodel.findById({ _id: sessionId })
            if (!session) return "no session found"
            try {
                const statef = state as FlowState
                const picked = _.pick(statef, ['isCompleted', 'name'])

                const st1 = {
                    "stages": statef.stageStates,
                    "tasks": statef.taskLedger,
                }
                const st = { ...st1, ...picked }
                session.stateBook.push(st)
            } catch (error) {
                this.logserv.logm('error in db', error)
            }

            return (await session.save())._id
        } catch (error) {
            return (JSON.stringify(error))
        }
    }
}
