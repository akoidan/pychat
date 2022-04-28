import type {OnGatewayConnection} from "@nestjs/websockets";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import {IncomingMessage} from "http";
import {
  Server,
  WebSocket,
} from "ws";
import type {OnWsClose} from "@/data/types/internal";
import {
  SendToClientPubSubMessage,
  WebSocketContextData,
} from "@/data/types/internal";
import {
  Logger,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import {SubscribePuBSub} from "@/modules/shared/pubsub/pubsub.service";
import {WebsocketService} from "@/modules/api/websocket/websocket.service";
import {WsDataService} from "@/modules/api/websocket/ws.data.service";
import {WsExceptionFilter} from "@/modules/api/websocket/ws.exception.filter";
import {MessageService} from "@/modules/api/websocket/message.service";
import {WsContext} from "@/modules/app/decorators/ws.context.decorator";
import {CatchWsErrors} from "@/modules/app/decorators/catch.ws.errors";
import {MessagesFromMyRoomGuard} from "@/modules/app/guards/own.message.guard";
import type {NestGateway} from "@nestjs/websockets/interfaces/nest-gateway.interface";
import {OwnRoomGuard} from "@/modules/app/guards/own.room.guard";




@WebSocketGateway({
  path: "/ws",
})
@UseFilters(new WsExceptionFilter())
export class WebsocketGateway implements OnGatewayConnection, OnWsClose, NestGateway {
  @WebSocketServer()
  public readonly server!: Server;

  constructor(
    public readonly logger: Logger,
    public readonly websocketService: WebsocketService,
    public readonly wsDataService: WsDataService,
    public readonly messageService: MessageService,
  ) {
  }

  @SubscribeMessage("closeConnection")
  public async closeConnection(@WsContext() context: WebSocketContextData) {
    await this.websocketService.closeConnection(context);
  }

  @CatchWsErrors
  async handleConnection(socket: WebSocket, message: IncomingMessage, context: WebSocketContextData) {
    await this.websocketService.handleConnection(message.url, context, (socket as any)._socket.remoteAddress);
  }

  @SubscribePuBSub("sendToClient")
  public sendToClient(ctx: WebSocketContextData, data: SendToClientPubSubMessage<any, any, any>) {
    ctx.sendToClient(data.body);
  }

  @SubscribeMessage("syncHistory")
  @UseGuards(
    // Messages ids are checked within roomsId
    OwnRoomGuard((data: SyncHistoryWsOutMessage) => data.roomIds)
  )
  public async syncHistory(
    @MessageBody() data: SyncHistoryWsOutMessage,
      @WsContext() context: WebSocketContextData
  ): Promise<SyncHistoryWsInMessage> {
    return this.messageService.syncHistory(data, context);
  }

  @SubscribeMessage("setMessageStatus")
  public async setMessageStatus(): Promise<void> {
    // This.messageService.setStatus
  }


  // @UseGuards(OwnMessageGuard)
  @SubscribeMessage("printMessage")
  @UseGuards(
    MessagesFromMyRoomGuard((data: PrintMessageWsOutMessage) => [data.parentMessage]),
    OwnRoomGuard((data: PrintMessageWsOutMessage) => [data.roomId])
  )
  public async printMessage(
    @MessageBody() data: PrintMessageWsOutMessage,
      @WsContext() context: WebSocketContextData
  ): Promise<void> {
    await this.messageService.printMessage(data, context);
  }

  @SubscribeMessage("showIType")
  @UseGuards(
    OwnRoomGuard((data: ShowITypeWsOutMessage) => [data.roomId])
  )
  public async showIType(
    @MessageBody() data: ShowITypeWsOutMessage,
      @WsContext() context: WebSocketContextData
  ): Promise<void> {
    await this.messageService.showIType(data, context);
  }

  @SubscribeMessage("getCountryCode")
  // TODO add cache here
  public async getCountryCode(
    @MessageBody() data: GetCountryCodeWsOutMessage,
      @WsContext() context: WebSocketContextData
  ): Promise<Omit<GetCountryCodeWsInMessage, "action" | "handler">> {
    return this.wsDataService.getCountryCodes(context);
  }
}
