import {
  IsEmail,
  IsString,
} from "class-validator";
import { ValidateUserEmailRequest } from '@/data/shared/http';

export class ValidateEmailRequestValidator implements ValidateUserEmailRequest {
  @IsString()
  @IsEmail()
  public email: string;
}
