import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { LogService } from '../logger/logger.service';
import * as shortid from 'shortid'
import { InteractiveService } from './interactive.service';
import * as postal from 'postal'
import { DataType, EndPoint, Route, CommunicationData } from 'ezsign-client';
import { ClientInteractEvent, CustomerInteractEvent, ServerInteractEvent } from 'ezsign-client'

@WebSocketGateway(80, { namespace: 'interact' })
export class InteractiveGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly TAG = "InteractiveServerGateway"
  private isClientConnected: boolean
  private isCustomerConnected: boolean
  private serverId: string
  @WebSocketServer() server: Server;

  constructor(private logger: LogService, private commserv: InteractiveService) {
    this.serverId = shortid.generate()
    this.logger.setContext(this.TAG)
  }

  afterInit(server: any) {
    this.logger.logm('interctive server id', this.serverId, this.TAG)
  }

  handleConnection(client: any, ...args: any[]) {
    const channelId = client.handshake.query.channelId
    const sessionId = client.handshake.query.sessionId
    const deviceType = client.handshake.query.deviceType

    const flowChannel = sessionId + '.' + channelId
    const interactChannel = "comm:" + sessionId + "." + channelId

    if (deviceType === EndPoint.CUSTOMER && !this.isCustomerConnected) {
      const ack: CommunicationData = this.getCommunicationData(ServerInteractEvent.ACK_INTERACTION_CONNECTION)
      this.sendDataByChannelId(interactChannel, ack)
      this.isCustomerConnected = true
    } else if (deviceType === EndPoint.CLIENT && !this.isClientConnected) {
      const ack: CommunicationData = this.getCommunicationData(ServerInteractEvent.ACK_INTERACTION_CONNECTION)
      this.sendDataByChannelId(interactChannel, ack)
      this.isClientConnected = true
    }

    client.on(interactChannel, async (data: CommunicationData) => {
      this.logger.logm('published on', interactChannel)
      this.logger.logm('received data', data)
      postal.channel(sessionId).publish(sessionId, data)
      this.commserv.save(data)
      switch (data.type) {
        case CustomerInteractEvent.COMMUNICATION_DATA || ClientInteractEvent.COMMUNICATION_DATA:
          const route: Route = this.getRoute(sessionId, data.route.channelId, flowChannel, interactChannel)
          const akdata: CommunicationData = this.getCommunicationData(ServerInteractEvent.ACK_COMMUNICATION_DATA, data.packetId, route)
          this.sendDataByChannelId(interactChannel, akdata)
          postal.channel(sessionId).publish(flowChannel, data)
          break;

        default:
          break;
      }
    })
  }

  handleDisconnect(client: any) {
    this.logger.log(`interactive Client disconnected: ${client.id}`);
  }

  /**
   * sends data via socket to client/customer
   * @param channelId id of channel to send this data to
   * @param data communication data
   */
  sendDataByChannelId(channelId, data: CommunicationData) {
    this.commserv.save(data)
    this.logger.logm('comm data', data)
    this.server.emit(channelId, data)
  }

  getCommunicationData(type: ServerInteractEvent, packetid?: string, route?: any, data?: any) {
    const commdata: CommunicationData = {
      type: type,
      time: Date.now(),
      packetId: packetid ? packetid : shortid.generate(),
      route: route ? route : undefined,
      data: data ? data : undefined,
      dataType: DataType.INTERACTION
    }
    return commdata
  }

  getRoute(sessionId, channelId, flowChannel, interactChannel) {
    const route: Route = {
      sessionId: sessionId,
      channelId: channelId,
      deviceType: EndPoint.SERVER,
      source: EndPoint.SERVER,
      flowChannel: flowChannel, //flow events channel
      interactChannel: interactChannel //communication related channel
    }
    return route
  }

}
