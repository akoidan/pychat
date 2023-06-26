import {ValidateUserEmailRequest} from "@common/http/auth/validte.email";

import {
  IsEmail,
  IsString,
} from "class-validator";


export class ValidateEmailRequestValidator implements ValidateUserEmailRequest {
  @IsString()
  @IsEmail()
  public email: string;
}
