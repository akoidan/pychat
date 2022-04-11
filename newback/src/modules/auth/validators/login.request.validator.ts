import {
  IsString,
  Matches,
} from 'class-validator';
import {LoginRequest} from '@/data/types/dto/dto';

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
