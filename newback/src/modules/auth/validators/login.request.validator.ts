import {
  IsEmail,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import {LoginRequest} from '@/data/types/dto/dto';

export class LoginRequestValidator implements LoginRequest {
  @IsString()
  @ValidateIf(o => !o.email)
  @Matches(/^\S+$/, {
    message: `Username can't contain whitespaces`
  })
  public username: string;

  @IsString()
  @IsEmail()
  @Matches(/^\S+$/, {
    message: `email can't contain whitespaces`
  })
  @ValidateIf(o => !o.username)
  public email: string;

  @IsString()
  @Matches(/^\S+$/, {
    message: `Password can't contain whitespaces`
  })
  public password: string;
}
