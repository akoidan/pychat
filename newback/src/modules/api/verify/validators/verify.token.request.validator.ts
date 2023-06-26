import {VerifyTokenRequest} from '@common/http/verify/verify.token';

import {IsString} from "class-validator";


export class VerifyTokenRequestValidator implements VerifyTokenRequest {
  @IsString()
  public token: string;
}
