import { Injectable } from '@nestjs/common';
import { ServerEvent, CustomerEvent, ClientEvent, DataType, EndPoint, ResponseData, Route } from 'ezsign-client';
import * as shortid from 'shortid'

@Injectable()
export class UtilService {
    getEventResponseData(sessionId, channelId, type: ServerEvent | CustomerEvent | ClientEvent, data?: any) {
        const responseData: ResponseData = {
            type: type,
            time: Date.now(),
            packetId: shortid.generate(),
            route: this.getRoute(sessionId, channelId),
            data: data ? data : undefined,
            dataType: DataType.FLOW
        }
        return responseData
    }

    getRoute(sessionId, channelId) {
        const route: Route = {
            sessionId: sessionId,
            channelId: channelId,
            deviceType: EndPoint.SERVER,
            source: EndPoint.SERVER,
            flowChannel: this.getChannelName(channelId, sessionId), //flow events channel
            interactChannel: this.getInteractChannelName(channelId, sessionId) //communication related channel
        }
        return route
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

    getInteractChannelName(chnl: string, session: string): string {
        return 'comm:' + session + "." + chnl
    }
}
