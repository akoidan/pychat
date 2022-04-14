import {
  Logger,
  WebSocketAdapter
} from '@nestjs/common';
import {BaseWsInstance} from '@nestjs/websockets';
import {
  CONNECTION_EVENT,
  DISCONNECT_EVENT,
  ERROR_EVENT,
  MESSAGE_METADATA
} from '@nestjs/websockets/constants';
import {MessageMappingProperties} from '@nestjs/websockets/gateway-metadata-explorer';
import {isFunction} from '@nestjs/common/utils/shared.utils';
import {
  Server,
  ServerOptions,
  WebSocket,
  WebSocketServer
} from "ws";


export class WsAdapter implements WebSocketAdapter<Server, WebSocket, ServerOptions> {

  private wsServer: WebSocketServer;

  constructor(
    private readonly httpServer: any,
    private readonly logger: Logger
  ) {

  }

  public bindClientConnect(server: BaseWsInstance, callback: Function) {
    server.on(CONNECTION_EVENT, async (...args) => {
     let ws: WebSocket =  args.find(a => a instanceof WebSocket)
     if ((ws as any).context) {
       throw Error("WTF");
     }
      (ws as any).context = {};
      await callback(...args, (ws as any).context)
    });
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
    options,
  ) {
    if (port !== 0 || !this.httpServer || !options.path) {
      throw Error("Unsupported server configuration");
    }
    this.wsServer = new WebSocketServer({
      noServer: true,
      ...options,
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
  ) {
    client.on(MESSAGE_METADATA, (data) => {
      if (client.readyState !== client.OPEN) {
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
