import {
  IsEmail,
  IsString,
} from 'class-validator';
import {ValidateUserEmailRequest} from '@/data/types/dto/dto';

export class ValidateEmailRequestValidator implements ValidateUserEmailRequest {
  @IsString()
  @IsEmail()
  public email: string;
}
