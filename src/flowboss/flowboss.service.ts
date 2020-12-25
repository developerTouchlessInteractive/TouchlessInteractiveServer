import { Injectable } from '@nestjs/common';
import { Broadcast, Notification, SessionSymphony } from '../broadcast.interface';
import { FlowManager } from '../flowmanager';

@Injectable()
export class FlowbossService implements Broadcast, SessionSymphony {

    flowSessions: FlowManager[] = [];

    registerSession(flowSession: FlowManager) {
        if (flowSession) {
            this.flowSessions.push(flowSession)
        }
    }

    getSessionCount(): number {
        return this.flowSessions.length
    }

    notifyAllFlows(notif: Notification) {
        this.flowSessions.forEach(order => {
            order.receiveBroadcast(notif)
        });
    }

    getSession(sessionId: string) {
        return new Promise<FlowManager>((resolve, reject) => {
            const sess = this.flowSessions.filter(x => x.sessionId === sessionId)
            sess.length > 0 ? resolve(sess[0]) : undefined
        })
    }

    isSessionLive(sessionId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const index = this.flowSessions.findIndex(x => x.sessionId === sessionId)
                if (index > -1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } catch (error) {
                reject('finding active flows session')
            }
        })
    }

    endSession(sessionId: string) {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const index = this.flowSessions.findIndex(x => x.sessionId === sessionId)
                if (index > -1) {
                    this.flowSessions.splice(index, 1)
                    resolve(true)
                } else {
                    resolve(false)
                }
            } catch (error) {
                reject('error removing session')
            }
        })
    }
}
