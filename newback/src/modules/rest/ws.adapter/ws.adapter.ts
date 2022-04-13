import {
  INestApplicationContext,
  Logger
} from '@nestjs/common';
import {
  AbstractWsAdapter,
  BaseWsInstance
} from '@nestjs/websockets';
import {
  CLOSE_EVENT,
  CONNECTION_EVENT,
  ERROR_EVENT,
  MESSAGE_METADATA,
  DISCONNECT_EVENT
} from '@nestjs/websockets/constants';
import {MessageMappingProperties} from '@nestjs/websockets/gateway-metadata-explorer';
import {Observable} from 'rxjs';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import {
  WebSocket,
  WebSocketServer
} from "ws";
import {NestApplication} from '@nestjs/core';


enum READY_STATE {
  CONNECTING_STATE = 0,
  OPEN_STATE = 1,
  CLOSING_STATE = 2,
  CLOSED_STATE = 3,
}


export class WsAdapter  {

  private wsServer: WebSocketServer;

  constructor(
    private httpServer: any,
    private readonly logger: Logger
  ) {

  }

  public bindClientConnect(server: BaseWsInstance, callback: Function) {
    server.on(CONNECTION_EVENT, callback);
  }

  public bindClientDisconnect(client: BaseWsInstance, callback: Function) {
    client.on(DISCONNECT_EVENT, callback);
  }

  public async close(server: BaseWsInstance) {
    const isCallable = server && isFunction(server.close);
    isCallable && (await new Promise(resolve => server.close(resolve)));
  }

  public create(
    port: number,
    {path}: {path: string},
  ) {
    if (port !== 0 || !this.httpServer || !path) {
      throw Error("Unsupported server configuration");
    }
    this.wsServer = new WebSocketServer({
      noServer: true,
      path,
    });

    this.httpServer.on('upgrade', (request, socket, head) => {
      this.wsServer.handleUpgrade(request, socket, head, (ws: unknown) => {
        this.wsServer.emit('connection', ws, request);
      });
    });

    this.httpServer.on(CONNECTION_EVENT, (ws: any) =>
      ws.on(ERROR_EVENT, (err: any) => this.logger.error(err)),
    );
    this.httpServer.on(ERROR_EVENT, (err: any) => this.logger.error(err));
    return this.wsServer;
  }

  public bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    client.on(MESSAGE_METADATA, (data) => {
      if (client.readyState !== READY_STATE.OPEN_STATE) {
        throw Error('asd')
      }
      const parsed = JSON.parse(data as any);
      if (!parsed.action) {
        throw Error("invalid message")
      }
      handlers.find(handler => handler.message === parsed.action).callback(parsed);
    });

  }

  public async dispose() {
    await this.httpServer.close();
  }

}
