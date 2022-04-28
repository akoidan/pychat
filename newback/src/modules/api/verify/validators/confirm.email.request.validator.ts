import {IsString} from "class-validator";



export class ConfirmEmailRequestValidator implements ConfirmEmailRequest {
  @IsString()
  public token: string;
}
