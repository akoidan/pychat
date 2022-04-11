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
  SignUpRequest,
  ValidateUserRequest
} from '@/data/types/dto/dto';
import {config} from 'node-config-ts';

export class ValidateUserRequestValidator implements ValidateUserRequest {
  @IsString()
  @Length(1, config.frontend.maxUserNameLength, {
    message: `Username should be 1-${config.frontend.maxUserNameLength} characters`
  })
  @Matches(/[a-zA-Z-_0-9]+/, {
    message: `Username can only contain latin characters, numbers and symbols '-' '_'`
  })
  public username: string;
}
