import { CommunicationData, comm_events } from "ti-framework";
import { FlowManager } from "./flowmanager";
import { LogService } from "./logger/logger.service";
import { InteractDataHandler, NotifyInteractionData } from "./ti.interface";

export class InteractDataProcessor implements InteractDataHandler, NotifyInteractionData {
    flowSession: FlowManager;

    constructor(session: FlowManager, logger: LogService) {
        this.setSession(session)
    }

    setSession(session: FlowManager) {
        this.flowSession = session
    }

    handleInteractDataFromCustomer(data: CommunicationData) {
        this.notifyInteractionToClient(data)
    }

    handleInteractDataFromClient(data: CommunicationData) {
        this.notifyInteractionToAllCustomers(data)
    }

    handleInteractDataByServer(data: CommunicationData) {
        this.notifyInteractionToClientAndCustomers(data)
    }

    notifyInteractionToClientAndCustomers(data: CommunicationData) {
        this.notifyInteractionToAllCustomers(data)
        this.notifyInteractionToClient(data)
    }

    notifyInteractionToAllCustomers(data: CommunicationData) {
        if (data) {
            this.flowSession.customerDevicesSubject.subscribe(customers => {
                customers.forEach(customer => {
                    /**
                     * when we have multiple customers register 
                     * do below
                     * 
                     * const sessionId = customer.sessionId
                     * const channelId = customer.customerChannel
                     * this.flowSession.sendInteractDataOnChannel(this.flowSession.getInteractChannelName(channelId, sessionId)
                     */
                    this.flowSession.sendInteractDataOnChannel(this.flowSession.getInteractChannelName(this.flowSession.customerChannel, this.flowSession.sessionId), data)
                });
            })
        }
    }

    notifyInteractionToCustomerById(data: CommunicationData, id: string) {
        this.flowSession.sendInteractDataOnChannel(id, data)
    }

    notifyInteractionToClient(data: CommunicationData) {
        if (data) {
            this.flowSession.sendInteractDataOnChannel(this.flowSession.getInteractChannelName(this.flowSession.clientChannel, this.flowSession.sessionId), data)
        }
    }


    isNotificationValidToCustomer(type: comm_events): boolean {
        throw new Error("Method not implemented.");
    }

    isNotificationValidToClient(type: comm_events): boolean {
        throw new Error("Method not implemented.");
    }
}