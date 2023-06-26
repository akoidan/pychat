import {HttpException} from "@nestjs/common";

export class ValidationException extends HttpException {
  constructor(error) {
    super(error, 4002);
  }
}
