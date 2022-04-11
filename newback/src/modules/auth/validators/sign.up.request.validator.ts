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
  SignUpRequest,
} from '@/data/types/dto/dto';
import {config} from 'node-config-ts';

export class SignUpRequestValidator implements SignUpRequest {

  @IsString()
  @Length(1, config.frontend.maxUserNameLength, {
    message: `Username should be 1-${config.frontend.maxUserNameLength} characters`
  })
  @Matches(/[a-zA-Z-_0-9]+/, {
    message: `Username can only contain latin characters, numbers and symbols '-' '_'`
  })
  public username: string;


  @IsString()
  @Length(3, 128, {
    message: "Passwords should contain 3-64 symbols"
  })
  @Matches(/^\S+$/, {
    message: `Password can't contain whitespaces`
  })
  public password: string;

  @IsOptional()
  @IsEnum(Gender)
  public sex?: Gender;

  @IsOptional()
  @IsEmail()
  public email?: string;

}
