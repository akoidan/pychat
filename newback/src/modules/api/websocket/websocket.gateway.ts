import {SyncHistoryWsOutBody} from "@common/ws/message/sync.history";
import type {SyncHistoryWsInMessage, SyncHistoryWsInBody} from "@common/ws/message/sync.history";
import {ShowITypeWsOutBody} from "@common/ws/message/show.i.type";
import {PrintMessageWsOutBody} from "@common/ws/message/print.message";
import {
  GetCountryCodeWsOutBody,
} from "@common/ws/message/get.country.code";
import type {
  GetCountryCodeWsInMessage,
} from "@common/ws/message/get.country.code";
import type {OnGatewayConnection} from "@nestjs/websockets";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import {IncomingMessage} from "http";
import {
  WebSocket,
} from "ws";
import type {OnWsClose} from "@/data/types/internal";
import {
  SendToClientPubSubMessage,
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
import {WebSocketContextData} from "@/data/types/patch";

@WebSocketGateway({
  path: "/ws",
})
@UseFilters(new WsExceptionFilter())
export class WebsocketGateway implements OnGatewayConnection, OnWsClose, NestGateway {
  @WebSocketServer()
  public readonly server!: any; // TODO

  public constructor(
    public readonly logger: Logger,
    public readonly websocketService: WebsocketService,
    public readonly wsDataService: WsDataService,
    public readonly messageService: MessageService,
  ) {
  }

  @SubscribeMessage("closeConnection")
  public async closeConnection(@WsContext() context: WebSocketContextData): Promise<void> {
    await this.websocketService.closeConnection(context);
  }

  @CatchWsErrors
  async handleConnection(socket: WebSocket, message: IncomingMessage, context: WebSocketContextData): Promise<void> {
    await this.websocketService.handleConnection(message.url, context, (socket as any)._socket.remoteAddress);
  }

  @SubscribePuBSub("sendToClient")
  public sendToClient(ctx: WebSocketContextData, data: SendToClientPubSubMessage<any, any, any>): void {
    ctx.sendToClient(data.body);
  }

  @SubscribeMessage("syncHistory")
  @UseGuards(
    // Messages ids are checked within roomsId
    OwnRoomGuard((data: SyncHistoryWsOutBody) => data.roomIds)
  )
  public async syncHistory(
    @MessageBody() data: SyncHistoryWsOutBody,
      @WsContext() context: WebSocketContextData
  ): Promise<SyncHistoryWsInBody> {
    return this.messageService.syncHistory(data, context);
  }

  @SubscribeMessage("setMessageStatus")
  public async setMessageStatus(): Promise<void> {
    // This.messageService.setStatus
  }


  // @UseGuards(OwnMessageGuard)
  @SubscribeMessage("printMessage")
  @UseGuards(
    MessagesFromMyRoomGuard((data: PrintMessageWsOutBody) => [data.parentMessage]),
    OwnRoomGuard((data: PrintMessageWsOutBody) => [data.roomId])
  )
  public async printMessage(
    @MessageBody() data: PrintMessageWsOutBody,
      @WsContext() context: WebSocketContextData
  ): Promise<void> {
    await this.messageService.printMessage(data, context);
  }

  @SubscribeMessage("showIType")
  @UseGuards(
    OwnRoomGuard((data: ShowITypeWsOutBody) => [data.roomId])
  )
  public async showIType(
    @MessageBody() data: ShowITypeWsOutBody,
      @WsContext() context: WebSocketContextData
  ): Promise<void> {
    await this.messageService.showIType(data, context);
  }

  @SubscribeMessage("getCountryCode")
  public async getCountryCode(
    @MessageBody() data: GetCountryCodeWsOutBody,
      @WsContext() context: WebSocketContextData
  ): Promise<GetCountryCodeWsInMessage["data"]> {
    return this.wsDataService.getCountryCodes(context);
  }
}
