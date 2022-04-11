import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  Gender,
  LoginRequest,
  SignUpRequest
} from '@/data/types/dto/dto';
import {config} from 'node-config-ts';

export class LoginRequestValidator implements LoginRequest {
  @IsString()
  @Matches(/^\S+$/, {
    message: `Username can't contain whitespaces`
  })
  public username: string;

  @IsString()
  @Matches(/^\S+$/, {
    message: `Password can't contain whitespaces`
  })
  public password: string;
}
