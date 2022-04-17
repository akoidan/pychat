import type {ExecutionContext,} from "@nestjs/common";
import {
  createParamDecorator,
  InternalServerErrorException,
} from "@nestjs/common";

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let userId = ctx.switchToHttp().getRequest().userId;
    if (!userId) {
      throw new InternalServerErrorException("Service should use auth guard");
    }
    return userId;
  },
);
