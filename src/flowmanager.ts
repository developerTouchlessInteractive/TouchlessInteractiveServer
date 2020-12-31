import { Notification } from "./broadcast.interface"
import { FlowEventHandler, InteractDataHandler, PostalListeners, SessionInterface } from "./ti.interface"
import * as postal from 'postal'
import { FlowdbService } from "./flow/flowdb/flowdb.service"
import { LogService } from "./logger/logger.service"
import * as shortid from 'shortid'
import { BehaviorSubject } from "rxjs"
import { FlowserverGateway } from "./flow/flowserver.gateway"
import { InteractiveGateway } from "./interactive/interactive.gateway"
import { SessiondbService } from "./flow/sessiondb/sessiondb.service"
import { FlowEventProcessor } from "./flowevent.processor"
import { InteractDataProcessor } from "./interactdata.processor"
import { TiTriggerHandler, TriggerHandlerFactory } from "./triggers/trigger.handler"
import { ServerEvent, CustomerEvent, ClientEvent, DataType, EndPoint, ResponseData, Route } from "ti-framework"
import { CommunicationData, FlowDetails } from "ti-framework"

export class FlowManager implements SessionInterface, PostalListeners {
    private readonly TAG = "FlowManager"

    private _inviteCode: string
    public get inviteCode(): string {
        return this._inviteCode
    }
    public set inviteCode(value: string) {
        if (!value || value.length === 0) throw new Error("invalid inviteCode");

        this._inviteCode = value
    }

    private _clientChannel: string
    public get clientChannel(): string {
        return this._clientChannel
    }
    public set clientChannel(value: string) {
        if (!value || value.length === 0) throw new Error("clientChannel invalid");

        this._clientChannel = value
    }

    private _customerChannel: string
    public get customerChannel(): string {
        return this._customerChannel
    }
    public set customerChannel(value: string) {
        if (!value || value.length === 0) throw new Error("customerChannel invalid");
        this._customerChannel = value
    }

    private _sessionId: string
    public get sessionId(): string {
        return this._sessionId
    }
    public set sessionId(value: string) {
        if (!value || value.length === 0) throw new Error("sessionIdis invalid");
        this._sessionId = value
    }

    /**
     * the server app uses postaljs event bus framework
     * to exchange flow-session information
     * https://github.com/postaljs/postal.js 
     */
    postalChannel: IChannelDefinition<unknown>

    /**
     * unique Id for this manager class instance
     */
    managerId

    /**
     * customer registered array to track registrations
     */
    private customerDevices: any[] = []
    customerDevicesSubject = new BehaviorSubject<any[]>(this.customerDevices)

    flowDetails: FlowDetails | undefined
    flowState
    taskLedger: any[] = [];

    /**
     * flow event and interaction data handlers 
     */
    flowEventHandler: FlowEventHandler
    interactDataHandler: InteractDataHandler

    // trigger state handler
    // handler to dertermine if stage or flow is complete upon 
    // a task is complete. check TriggerHandler class
    private _triggerHandler: TiTriggerHandler
    public get triggerHandler(): TiTriggerHandler {
        return this._triggerHandler
    }
    public set triggerHandler(value: TiTriggerHandler) {
        if (!value) throw new Error("titrigger handler passed in is invalid");

        this._triggerHandler = value
    }

    constructor(flowDetail: any,
        private flowDbService: FlowdbService,
        private logger: LogService,
        private flowServerGateway: FlowserverGateway,
        private interactionServerGateway: InteractiveGateway,
        private sessionDbService: SessiondbService) {
        this.flowDetails = flowDetail
        if (!this._sessionId) this._sessionId = shortid.generate()
        if (!this._clientChannel) this._clientChannel = shortid.generate()
        if (!this._customerChannel) this._customerChannel = shortid.generate()

        this.logger.log('customer topic is ' + this.customerChannel, this.TAG)
        this.logger.log('client topic ' + this.clientChannel, this.TAG)
        this.logger.log('session id ' + this.sessionId, this.TAG)
        if (!this.managerId) {
            this.managerId = shortid.generate()
        }
        this.logger.log('manager ID ' + this.managerId, this.TAG)

        this.flowEventHandler = new FlowEventProcessor(this, this.logger) //there is a event handler setter aswell for Testing purposes
        this.interactDataHandler = new InteractDataProcessor(this, this.logger) //there is a data handler setter aswell for Testing purposes

        /**
         * the postal channel is sessionId
         * take a look at handleConnection() of 
         * the flowServerGateway and interactionServerGateway
         * as they receive they emit on the sessionId channel.
         */
        this.postalChannel = postal.channel(this.sessionId);

        /**
         * we would subscribe on all three topics
         * session
         * client and customer
         */
        this.listenToSession()
        this.listenToDataFromClient(this.getChannelName(this.clientChannel, this.sessionId))
        this.listenToDataFromCustomer(this.getChannelName(this.customerChannel, this.sessionId))

        this.logger.logm('flow_details', this.flowDetails, this.TAG)
        this._triggerHandler = TriggerHandlerFactory.getInstance().getTriggerHandler(this.flowDetails, this.flowDbService)
    }

    /**
    * postal subscription to listen to any communication data and flow events
    * passed on the postal channel for session
    */
    listenToSession() {
        const sessionSubscription = this.postalChannel.subscribe(this.sessionId, async (data: (ResponseData | CommunicationData), envelope) => {
            try {
                this.logger.logm('postal data', data)
                if (data.dataType === DataType.INTERACTION) {
                    this.storeInteractEvent(data as CommunicationData)
                } else {
                    this.storeFlowEvent(data as ResponseData)
                }
            } catch (error) {
                this.logger.logm('error checking', error)
            }
        })
    }


    /**
     * postal subscription to listen to any communication data and flow events
     * passed on the client channel (topic)
     */
    listenToDataFromClient(clientChannelName: string) {
        const clientSubscription = this.postalChannel.subscribe(clientChannelName, async (data: ResponseData | CommunicationData, envelope) => {
            try {
                this.logger.logm('interactive postal data', data)
                if (data.dataType === DataType.INTERACTION) {
                    this.logger.logm('postal data', data)
                    this.interactDataHandler.handleInteractDataFromClient(data as CommunicationData)
                } else {
                    this.logger.logm('flow event postal data', data)
                    this.flowEventHandler.handleFlowEventFromClient(data as ResponseData)
                }
            } catch (error) {
                this.logger.logm('error checking', error)
            }
        })
    }


    /**
    * postal subscription to listen to any communication data and flow events
    * passed on the customer channel (topic)
    */
    listenToDataFromCustomer(customerChannelName: string) {
        const customerSubscription = this.postalChannel.subscribe(customerChannelName, async (data: ResponseData | CommunicationData, envelope) => {
            try {
                this.logger.logm('interactive postal data', data)
                if (data.dataType === DataType.INTERACTION) {
                    this.logger.logm('postal data', data)
                    this.interactDataHandler.handleInteractDataFromCustomer(data as CommunicationData)
                } else {
                    this.logger.logm('flow event postal data', data)
                    this.flowEventHandler.handleFlowEventFromCustomer(data as ResponseData)
                }
            } catch (error) {
                this.logger.logm('error checking', error)
            }
        })
    }

    /**
     * method to send flow event to client/channel 
     * @param channelId the event equivalent of socket communication, channelId 
     * of either client or customer on which the ResponseData of Flow is emitted on.
     * @param event flow event data to be sent
     */
    async sendFlowEventOnChannel(channelId: string, event: ResponseData) {
        if (event) {
            await this.flowServerGateway.sendEventByChannelId(channelId, event)
        }
    }

    /**
     * method to send interaction data to client/channel 
     * @param channelId the event equivalent of socket communication, channelId 
     * of either client or customer on which the InteractionData of Flow is emitted on.
     * @param data flow interaction data to be sent
     */
    sendInteractDataOnChannel(channelId: string, data: CommunicationData) {
        if (data) {
            this.interactionServerGateway.sendDataByChannelId(channelId, data)
        }
    }

    receiveBroadcast(notification: Notification) {
        throw new Error("Method not implemented.")
    }

    /**
     * register a customer device 
     * @param customer customer registering for flow
     */
    registerCustomer(registerData: any) {
        const cc = { 'serverCustomerChannel': this.customerChannel }
        registerData = { registerData, ...cc }
        this.customerDevices.push(registerData)
        this.customerDevicesSubject.next(this.customerDevices)
        //notify client about new customer registration
    }

    /**
     * creates unique channel for client or customer with session id
     * replace with your implementation if needed
     * @param chnl customer or client channel id
     * @param session session id 
     */
    getChannelName(chnl: string, session: string): string {
        return session + "." + chnl
    }

    /**
     * creates unique channel name for interaction/communication channel.
     * replace with your implementation if needed
     * @param channelId customer or client channel id
     * @param sessionId session id
     */
    getInteractChannelName(chnl: string, session: string): string {
        return 'comm:' + session + "." + chnl
    }

    async storeFlowEvent(event: ResponseData) {
        try {
            await this.sessionDbService.updateEventBook(this.sessionId, event)
        } catch (error) {
            this.logger.logm('error storing event', error)
        }
    }

    /**
     * stores the flow event in session database
     * @param event flow event
     */
    async storeFlowState(state: any) {
        try {
            await this.sessionDbService.updateStateBook(this.sessionId, state)
        } catch (error) {
            this.logger.logm('error storing event', error)
        }
    }

    /**
     * stores the interaction data in interact database
     * @param data interaction data (ex: chat message)
     */
    async storeInteractEvent(data: CommunicationData) {
        try {
            await this.sessionDbService.updateInteractBook(this.sessionId, this.inviteCode, data)
        } catch (error) {
            this.logger.logm('error storing event', error)
        }
    }

    getEventResponseData(endpoint: EndPoint, type: ServerEvent | CustomerEvent | ClientEvent, packetid?: string, data?: any) {
        const responseData: ResponseData = {
            type: type,
            time: Date.now(),
            packetId: packetid ? packetid : shortid.generate(),
            route: this.getRoute((endpoint === EndPoint.CUSTOMER) ? this._customerChannel : this._clientChannel),
            data: data ? data : undefined,
            dataType: DataType.FLOW
        }
        return responseData
    }

    getRoute(channelId) {
        const route: Route = {
            sessionId: this.sessionId,
            channelId: channelId,
            deviceType: EndPoint.SERVER,
            source: EndPoint.SERVER,
            flowChannel: this.getChannelName(channelId, this.sessionId), //flow events channel
            interactChannel: this.getInteractChannelName(channelId, this.sessionId) //communication related channel
        }
        return route
    }
}