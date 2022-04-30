import type {
  DefaultWsInMessage,
  RequestWsOutMessage,
  ResponseWsInMessage,
} from "@common/ws/common";
import {
  DefaultWsInMessage,
  RequestWsOutMessage,
  ResponseWsInMessage
} from "@common/ws/common";

import type {
  Logger,
  WebSocketAdapter,
} from "@nestjs/common";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import type {
  BaseWsInstance,
  MessageMappingProperties,
} from "@nestjs/websockets";
import {
  CLOSE_EVENT,
  CONNECTION_EVENT,
  DISCONNECT_EVENT,
  ERROR_EVENT,
  MESSAGE_METADATA,
} from "@nestjs/websockets/constants";
import {isFunction} from "@nestjs/common/utils/shared.utils";
import type {
  Server,
  ServerOptions,
} from "ws";
import {
  WebSocket,
  WebSocketServer,
} from "ws";
import {processErrors} from "@/modules/app/decorators/catch.ws.errors";


export class WsAdapter implements WebSocketAdapter<Server, WebSocket, ServerOptions> {
  private wsServer: WebSocketServer;

  constructor(
    private readonly httpServer: any,
    private readonly logger: Logger
  ) {

  }

  public bindClientConnect(server: BaseWsInstance, callback: Function) {
    server.on(CONNECTION_EVENT, async(...args) => {
      const ws: WebSocket = args.find((a) => a instanceof WebSocket);
      const oldSend: WebSocket["send"] = ws.send.bind(ws);
      (ws as any).context = {
        sendToClient: (data: DefaultWsInMessage<any, any, any>) => {
          let message;
          try {
            message = JSON.stringify(data);
          } catch (e) {
            processErrors(e, ws, this.logger);
            return;
          }
          if (message.length > 2000) {
            this.logger.verbose(message, `ws:out:${(ws as any)?.context?.id}`);
          } else {
            this.logger.debug(message, `ws:out:${(ws as any)?.context?.id}`);
          }
          oldSend(message);
        },
      };
      ws.send = (ws as any).context.sendToClient;
      await callback(...args, (ws as any).context);
    });
  }

  public bindClientDisconnect(client: BaseWsInstance, callback: Function) {
    client.on(DISCONNECT_EVENT, (...arg) => {
      this.logger.log(`Closing connection ${(client as any)?.context?.id}`, "ws");
      callback(...arg);
    });
  }

  public async close(server: BaseWsInstance) {
    const isCallable = server && isFunction(server.close);
    isCallable && await new Promise((resolve) => server.close(resolve));
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

    this.httpServer.on("upgrade", (request, socket, head) => {
      this.wsServer.handleUpgrade(request, socket, head, (ws: unknown) => {
        this.wsServer.emit("connection", ws, request);
      });
    });

    this.httpServer.on(CONNECTION_EVENT, (ws: any) => ws.on(ERROR_EVENT, (err: any) => {
      this.logger.error(err, err?.stack, "ws");
    }),);
    this.httpServer.on(ERROR_EVENT, (err: any) => {
      this.logger.error(err, err?.stack, "ws");
    });
    return this.wsServer;
  }

  public bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
  ) {
    client.on(MESSAGE_METADATA, async(data) => {
      let parsed: RequestWsOutMessage<any, any>;
      try {
        const s = String(data);
        if (s.length > 2000) {
          this.logger.verbose(s, `ws:in:${(client as any)?.context?.id}`);
        } else {
          this.logger.debug(s, `ws:in:${(client as any)?.context?.id}`);
        }
        if (client.readyState !== client.OPEN) {
          throw new BadRequestException("Cannot process new messages, while opening a connection");
        }
        parsed = JSON.parse(s);
        if (!parsed.action) {
          throw new BadRequestException("Invalid message structure, \"action\" property is not defined");
        }
        const handler = handlers.find((handler) => handler.message === parsed.action);
        if (!handler) {
          throw new BadRequestException(`Unknown handler ${parsed.action}`);
        }
        if (!parsed.data) {
          throw new BadRequestException(`No data for ${parsed.action}`);
        }
        const result: any | undefined = await handler.callback(parsed.data);
        if (result) {
          if (!parsed.cbId) {
            throw new InternalServerErrorException(`Gateway ${parsed.action} returned result ${result}, without having cbId`);
          }
          const response: ResponseWsInMessage<any> = {
            cbBySender: (client as any).context.id,
            cbId: parsed.cbId,
            data: result,
          };
          client.send(response);
        }
      } catch (e) {
        processErrors(e, client, this.logger);
      }
    });

    client.on(CLOSE_EVENT, (...arg) => {
      this.logger.log(`Closing connection ${(client as any)?.context?.id}`, "ws");
      handlers.find((handler) => handler.message === "closeConnection").callback();
    });
  }

  public async dispose() {
    await this.httpServer.close();
  }
}
