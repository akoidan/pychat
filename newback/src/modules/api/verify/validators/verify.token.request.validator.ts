import {
  IsEmail,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import {VerifyTokenRequest} from '@/data/types/frontend';


export class VerifyTokenRequestValidator implements VerifyTokenRequest {
  @IsString()
  public token: string;
}
