import {IsString} from "class-validator";



export class VerifyTokenRequestValidator implements VerifyTokenRequest {
  @IsString()
  public token: string;
}
