import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { LogService } from '../logger/logger.service';
import { Socket } from 'socket.io';
import * as postal from 'postal'
import * as shortid from 'shortid'
import { UtilService } from '../util/util.service';
import { ServerEvent, EndPoint, ResponseData } from 'ezsign-client';

@WebSocketGateway()
export class FlowserverGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly TAG = "FlowServerGateway"
  private serverId: string
  clientChannel: string
  custommerChannel: string
  private isClientConnected: boolean
  private isCustomerConnected: boolean

  @WebSocketServer() server: Server;

  constructor(private logger: LogService,
    private utilServ: UtilService) {
    this.serverId = shortid.generate()
    this.logger.setContext(this.TAG)
  }

  afterInit(server: any) {
    this.logger.log('Init')
    this.logger.logm('server id', this.serverId)
  }

  async handleConnection(client: Socket) {
    const topic = client.handshake.query.channelId
    const sessionId = client.handshake.query.sessionId
    const deviceType = client.handshake.query.deviceType
    const event = sessionId + "." + topic

    if (deviceType === EndPoint.CUSTOMER && !this.isCustomerConnected) {
      this.custommerChannel = event
      const ack: ResponseData = this.utilServ.getEventResponseData(sessionId, topic, ServerEvent.ACK_CONNECTION)
      postal.channel(sessionId).publish(sessionId, ack)
      await this.sendEventByChannelId(event, ack)
      this.isCustomerConnected = true
    } else if (deviceType === EndPoint.CLIENT && !this.isClientConnected) {
      this.clientChannel = event
      const ack: ResponseData = this.utilServ.getEventResponseData(sessionId, topic, ServerEvent.ACK_CONNECTION)
      postal.channel(sessionId).publish(sessionId, ack)
      await this.sendEventByChannelId(event, ack)
      this.isClientConnected = true
    }

    client.on(event, (data) => {
      this.logger.log('topic is  ' + event)
      postal.channel(sessionId).publish(event, data)
      postal.channel(sessionId).publish(sessionId, data)
    })
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  /**
   * sends data via socket to client/customer
   * @param channelId id of channel to send this data to
   * @param data responseEvent data
   */
  sendEventByChannelId(channelId, data: ResponseData): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.logger.logm('sending data', data)
        this.server.emit(channelId, data)
        resolve()
      } catch (error) {
        reject()
      }
    })
  }
}
