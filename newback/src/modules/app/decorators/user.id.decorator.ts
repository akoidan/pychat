import type {ExecutionContext} from "@nestjs/common";
import {
  createParamDecorator,
  InternalServerErrorException,
} from "@nestjs/common";

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const {userId} = ctx.switchToHttp().getRequest();
    if (!userId) {
      throw new InternalServerErrorException("Service should use auth guard");
    }
    return userId;
  },
);
