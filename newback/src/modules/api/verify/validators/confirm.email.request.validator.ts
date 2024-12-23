import {ConfirmEmailRequest} from '@common/http/verify/confirm.email';

import {IsString} from "class-validator";


export class ConfirmEmailRequestValidator implements ConfirmEmailRequest {
  @IsString()
  public token: string;
}
