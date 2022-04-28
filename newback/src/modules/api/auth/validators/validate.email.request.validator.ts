import {
  IsEmail,
  IsString,
} from "class-validator";


export class ValidateEmailRequestValidator implements ValidateUserEmailRequest {
  @IsString()
  @IsEmail()
  public email: string;
}
