import type {SignInRequest,} from "@common/http/auth/sign.in";
import {
  IsEmail,
  IsString,
  Matches,
  ValidateIf,
} from "class-validator";


export class LoginRequestValidator implements SignInRequest {
  @ValidateIf((o) => !o.email || o.username)
  @IsString()
  @Matches(/^\S+$/, {
    message: "Username can't contain whitespaces",
  })
  public username?: string;

  @ValidateIf((o) => !o.username || o.email)
  @IsString()
  @IsEmail()
  @Matches(/^\S+$/, {
    message: "email can't contain whitespaces",
  })
  public email?: string;

  @IsString()
  @Matches(/^\S+$/, {
    message: "Password can't contain whitespaces",
  })
  public password: string;
}