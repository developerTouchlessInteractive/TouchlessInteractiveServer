
import { CommunicationData, comm_events } from "ti-framework";
import { ServerEvent, CustomerEvent, ClientEvent, ResponseData } from "ti-framework";
import { FlowManager } from "./flowmanager";

export interface PostalListeners {
    /**
    * postal subscription to listen to any communication data and flow events
    * passed on the postal channel for session
    */
    listenToSession()

    /**
     * postal subscription to listen to any communication data and flow events
     * passed on the client channel (topic)
     */
    listenToDataFromClient(channelId: string)

    /**
    * postal subscription to listen to any communication data and flow events
    * passed on the customer channel (topic)
    */
    listenToDataFromCustomer(customerChannelId: string)
}

export interface SessionInterface {
    /**
     * flow event handler, handles flow events
     * from customer/client/server
     */
    flowEventHandler: FlowEventHandler

    /**
     * interaction data handler, handles interaction data
     * from customer/client/server
     */
    interactDataHandler: InteractDataHandler

    /**
     * stores the flow event in session database
     * @param event flow event
     */
    storeFlowEvent(event: ResponseData)

    /**
     * stores the interaction data in interact database
     * @param data interaction data (ex: chat message)
     */
    storeInteractEvent(data: CommunicationData)

    /**
     * method to send flow event to client/channel 
     * @param channelId the event equivalent of socket communication, channelId 
     * of either client or customer on which the ResponseData of Flow is emitted on.
     * @param event flow event data to be sent
     */
    sendFlowEventOnChannel(channelId: string, event: ResponseData)

    /**
     * method to send interaction data to client/channel 
     * @param channelId the event equivalent of socket communication, channelId 
     * of either client or customer on which the InteractionData of Flow is emitted on.
     * @param data flow interaction data to be sent
     */
    sendInteractDataOnChannel(channelId: string, data: CommunicationData)

    /**
     * creates unique channel for client or customer with session id
     * replace with your implementation if needed
     * @param channelId customer or client channel id
     * @param sessionId session id
     */
    getChannelName(channelId: string, sessionId: string): string

    /**
     * creates unique channel name for interaction/communication channel.
     * replace with your implementation if needed
     * @param channelId customer or client channel id
     * @param sessionId session id
     */
    getInteractChannelName(channelId: string, sessionId: string): string
    registerCustomer(registerData: any)
}

/**
 * incoming and outgoing flow events handler for a session.
 * processes the flow events and triggers/notifies respective end points(client/customer)
 */
export interface FlowEventHandler {
    flowSession: FlowManager
    /**
     * set the session- flow manager for this flow event handler implementor.
     * @param session flow manager instance for the session
     */
    setSession(session: FlowManager)

    /**
     * process the flow event from customer
     * example: determina if task-stage-flow is complete
     * and trigger necessary events for client and server
     * @param event flow event from customer
     */
    handleFlowEventFromCustomer(event: ResponseData)

    /**
     * process flow event from client
     * example use case: skip a stage/task 
     * @param event flow event from client
     */
    handleFlowEventFromClient(event: ResponseData)

    /**
     * process the flow event from server,
     * example: notify client and customer about system wide alert.
     * @param event flow event by server
     */
    handleFlowEventByServer(event: ResponseData)

    /**
     * utility method to ensure the notification to be sent to client is valid.
     * example: may be not all flow events from server/customer has to be notified
     * @param type event type
     */
    isNotificationValidToCustomer(type: ServerEvent | CustomerEvent | ClientEvent): boolean

    /**
    * utility method to ensure the notification to be sent to customer is valid.
    * example: may be not all flow events from server/client has to be notified
    * @param type event type
    */
    isNotificationValidToClient(type: ServerEvent | CustomerEvent | ClientEvent): boolean
}

/**
 * incoming and outgoing interaction data handler.
 * processes the data and triggers/notifies respective end points(client/customer)
 */
export interface InteractDataHandler {
    flowSession: FlowManager
    /**
     * set the session- flow manager for this interaction data handler implementor.
     * @param session flow manager instance for the session
     */
    setSession(session: FlowManager)

    /**
     * process the interaction data from customer
     * and notify client
     * @param data interaction data from customer
     */
    handleInteractDataFromCustomer(data: CommunicationData)

    /**
     * process the interaction data from client
     * and notify customer
     * @param data interaction data by server
     */
    handleInteractDataFromClient(data: CommunicationData)

    /**
     * process the interaction data from server
     * and notify client & customer
     * @param data interaction data by server
     */
    handleInteractDataByServer(data: CommunicationData)

    /**
    * utility method to ensure the notification to be sent to customer is valid.
    * @param communication event type
    */
    isNotificationValidToCustomer(type: comm_events): boolean

    /**
    * utility method to ensure the notification to be sent to client is valid.
    * @param type communication event type
    */
    isNotificationValidToClient(type: comm_events): boolean
}


/**
 * communication methods about a response data  a.k.a flow event 
 * notify client/customer about the flow event
 */
export interface NotifyFlowEvent {
    notifyClientAndCustomer(type: ServerEvent | CustomerEvent | ClientEvent, data?: ResponseData)
    notifyAllCustomers(type: ServerEvent | CustomerEvent | ClientEvent, data?: ResponseData)//notify all customers 
    notifyCustomerById(type: ServerEvent | CustomerEvent | ClientEvent, data?: ResponseData)// notify single customer by his channelId
    notifyClient(type: ServerEvent | CustomerEvent | ClientEvent, data?: ResponseData)
}

/**
 * communication methods about a data  transfer 
 * notify client/customer about the interaction data
 */
export interface NotifyInteractionData {
    notifyInteractionToClientAndCustomers(data: CommunicationData)
    notifyInteractionToAllCustomers(data: CommunicationData)//notify all customers 
    notifyInteractionToCustomerById(data: CommunicationData, id: string)// notify single customer by his channelId
    notifyInteractionToClient(data: CommunicationData)
}

