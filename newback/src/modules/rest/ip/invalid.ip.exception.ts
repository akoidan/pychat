import {HttpException} from '@nestjs/common';

export class InvalidIpException extends HttpException {
  public readonly networkError: boolean;
  public readonly ip: string;
  constructor(ip: string, error: string, networkError: boolean) {
    super(error,networkError ? 500 : 400);
    this.networkError = networkError;
    this.ip = ip;
  }
}
