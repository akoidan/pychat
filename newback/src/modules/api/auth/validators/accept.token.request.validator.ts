import {
  IsEmail,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import {
  AcceptTokenRequest,
  VerifyTokenRequest
} from '@/data/types/frontend';


export class AcceptTokenRequestValidator implements AcceptTokenRequest {
  @IsString()
  public token: string;

  @IsString()
  @Length(3, 128, {
    message: "Passwords should contain 3-64 symbols"
  })
  @Matches(/^\S+$/, {
    message: `Password can't contain whitespaces`
  })
  public password: string;
}
