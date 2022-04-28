import type {Logger} from "@nestjs/common";
import {UnauthorizedException} from "@nestjs/common";
import type {OnGatewayConnection} from "@nestjs/websockets";


export function processErrors(e, socket, logger: Logger) {
  logger.error(`Ws error ${e.message}`, e.stack, "ws");
  if (e instanceof UnauthorizedException) {
    socket.close(WS_SESSION_EXPIRED_CODE, (e.message || "Invalid session").substr(0, 123));
  } else if (e?.status >= 400 && e?.status < 500) { // Invalid frame payload data
    socket.close(1007, `Error during creating a connection ${e.message}`.substr(0, 123));
  } else { // Internal Error
    socket.close(1011, `Error during opening a socket ${e.message}`.substr(0, 123)); // Message cannot be greather 123 bytes
  }
}

interface TargetCatchErrors extends OnGatewayConnection {
  logger: Logger;
}

export function CatchWsErrors(target: TargetCatchErrors, memberName: "handleConnection", propertyDescriptor: PropertyDescriptor) {
  return {
    get() {
      const wrapperFn = async function(socket, ...args) {
        try {
          return await propertyDescriptor.value.apply(this, [socket, ...args]);
        } catch (e) { // Need to catch , otherwise node process crashes
          processErrors(e, socket, this.logger);
        }
      };

      Object.defineProperty(this, memberName, {
        value: wrapperFn,
        configurable: true,
        writable: true,
      });
      return wrapperFn;
    },
  };
}
