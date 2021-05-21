import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogService } from '../../logger/logger.service';
import { SessionStructure } from '../sessionstructure.model';
import cryptoRandomString = require('crypto-random-string');
import { CommunicationData, FlowState, ResponseData } from 'ti-framework';
import * as _ from 'lodash'
import { query } from 'express';

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
            var session: SessionStructure = await this.flowsessionmodel.findById({ _id: sessionId }).lean()
            if (!session) return "no session found"

            const book = session.eventBook ? session.eventBook : []
            book.push(event)
            const options = { upsert: false };

            const result = await this.flowsessionmodel.updateOne({ _id: sessionId }, { eventBook: book }, options);
            if (result.ok != 1) {
                return false
            }
            return true
        } catch (error) {
            return (JSON.stringify(error))
        }
    }

    async updateInteractBook(sessionId: string, code: string, event: CommunicationData) {
        try {
            const code_query = { inviteCode: code, _id: sessionId };
            const session = await this.flowsessionmodel.findOne(code_query);
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
            const code_query = { _id: sessionId };
            var session: SessionStructure = await this.flowsessionmodel.findById(code_query)
            if (!session) return "no session found"
            let book = undefined
            try {
                const statef = state as FlowState
                const picked = _.pick(statef, ['isCompleted', 'name'])

                const st1 = {
                    "stages": statef.stageStates,
                    "tasks": statef.taskLedger,
                }
                const st = { ...st1, ...picked }
                book = session.stateBook ? session.stateBook : []
                book.push(st)
            } catch (error) {
                this.logserv.logm('error in db', error)
            }

            const options = { upsert: false };
            const result = await this.flowsessionmodel.updateOne({ _id: sessionId }, { stateBook: book }, options);
            if (result.ok != 1) {
                return false
            }
            return true
        } catch (error) {
            return (JSON.stringify(error))
        }
    }
}
