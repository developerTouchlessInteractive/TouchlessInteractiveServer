import { EndPoint, ResponseData, CustomerEvent, ServerEvent, ClientEvent } from "ti-framework";
import { FlowManager } from "./flowmanager";
import { FlowEventHandler, NotifyFlowEvent } from "./ti.interface";
import { LogService } from "./logger/logger.service";
import { TriggerListener } from "./triggers/trigger.handler";

export class FlowEventProcessor implements FlowEventHandler, NotifyFlowEvent {
    flowSession: FlowManager;

    constructor(session: FlowManager, logger: LogService) {
        this.setSession(session)
    }

    async handleFlowEventFromCustomer(event: ResponseData) {
        switch (event.type) {
            case CustomerEvent.TASK_COMPLETE_REQUEST:
                //send ack from server for task complete request
                await this.sendAckFromServer(ServerEvent.ACK_TASK_COMPLETE_REQUEST, EndPoint.CUSTOMER)
                const ref = event.data.taskState.uniqueReference
                await this.flowSession.triggerHandler.isTaskComplete(ref, new StateListener(this))
                break;
            default:
                if (this.isNotificationValidToClient(event.type)) {
                    await this.notifyClient(event)
                }
                break;
        }
    }


    setSession(session: FlowManager) {
        this.flowSession = session
    }

    async storeStateEvent(data?: any) {
        await this.flowSession.storeFlowState(data)
    }

    handleFlowEventFromClient(event: ResponseData) {
        throw new Error("Method not implemented.");
    }

    handleFlowEventByServer(event: ResponseData) {
        throw new Error("Method not implemented.");
    }

    async notifyClientAndCustomer(type: ServerEvent | CustomerEvent | ClientEvent, data?: any) {
        try {
            const ackResponseData: ResponseData = this.flowSession.getEventResponseData(EndPoint.CLIENT, type, undefined, data ? data : undefined)
            await this.flowSession.storeFlowEvent(ackResponseData)
            await this.flowSession.sendFlowEventOnChannel(ackResponseData.route.flowChannel, ackResponseData)
            const ackResponseDataCustomer: ResponseData = this.flowSession.getEventResponseData(EndPoint.CUSTOMER, type, undefined, data ? data : undefined)
            await this.flowSession.storeFlowEvent(ackResponseDataCustomer)
            await this.flowSession.sendFlowEventOnChannel(ackResponseDataCustomer.route.flowChannel, ackResponseDataCustomer)
        } catch (error) {
            console.log(`unable to send event ${JSON.stringify(type)} to client/customer`)
            console.log('error' + JSON.stringify(error))
        }
    }

    //TODO future implementation for notifying multiple customers
    notifyAllCustomers(type: ServerEvent | CustomerEvent | ClientEvent, data?: ResponseData) {
        throw new Error("Method not implemented.")
    }

    async notifyCustomerById(type: ServerEvent | CustomerEvent | ClientEvent, data?: ResponseData) {
        const ackResponseData: ResponseData = this.flowSession.getEventResponseData(EndPoint.CUSTOMER, type, undefined, data ? data : undefined)
        await this.flowSession.sendFlowEventOnChannel(ackResponseData.route.flowChannel, ackResponseData)
        await this.flowSession.storeFlowEvent(ackResponseData)

    }

    async notifyClient(type: ServerEvent | CustomerEvent | ClientEvent, data?: ResponseData) {
        const ackResponseData: ResponseData = this.flowSession.getEventResponseData(EndPoint.CLIENT, type, undefined, data ? data : undefined)
        await this.flowSession.sendFlowEventOnChannel(ackResponseData.route.flowChannel, ackResponseData)
        await this.flowSession.storeFlowEvent(ackResponseData)
    }

    async sendAckFromServer(type: ServerEvent | CustomerEvent | ClientEvent, endpoint: EndPoint, data?: ResponseData) {
        const ackResponseData: ResponseData = this.flowSession.getEventResponseData(endpoint, type, undefined, data ? data : undefined)
        await this.flowSession.sendFlowEventOnChannel(ackResponseData.route.flowChannel, ackResponseData)
        await this.flowSession.storeFlowEvent(ackResponseData)
    }

    isNotificationValidToCustomer(type: ServerEvent | CustomerEvent | ClientEvent): boolean {
        return true
    }

    /**
     * based on channel event type decide if this can go
     * to client
     * @param type channel event type
     */
    isNotificationValidToClient(type: ServerEvent | CustomerEvent | ClientEvent): boolean {
        return true
    }
}

class StateListener implements TriggerListener {
    eventProcessor: FlowEventProcessor
    constructor(flow: FlowEventProcessor) {
        this.eventProcessor = flow
    }
    taskIsComplete(taskReference: string, flowState: any) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const data = { "uniqueReference": taskReference }
                await this.eventProcessor.storeStateEvent(flowState)
                await this.eventProcessor.notifyClientAndCustomer(ServerEvent.TASK_COMPLETE, data)
                resolve()
            } catch (error) {
                console.log(' eror while notifying task  is complete')
                reject()
            }
        })
    }

    stageIsComplete(stageReference: string, flowState: any) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const data = { "uniqueReference": stageReference }
                await this.eventProcessor.storeStateEvent(flowState)
                await this.eventProcessor.notifyClientAndCustomer(ServerEvent.STAGE_COMPLETE, data)
                resolve()
            } catch (error) {
                reject()
            }
        })

    }

    flowIsComplete(flowState: any) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await this.eventProcessor.storeStateEvent(flowState)
                await this.eventProcessor.notifyClientAndCustomer(ServerEvent.FLOW_COMPLETE)
                resolve()
            } catch (error) {
                reject()
            }
        })
    }

}