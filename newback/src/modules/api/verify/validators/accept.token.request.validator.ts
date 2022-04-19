import {
  IsString,
  Length,
  Matches,
} from "class-validator";
import { AcceptTokenRequest } from '@/data/shared/http';


export class AcceptTokenRequestValidator implements AcceptTokenRequest {
  @IsString()
  public token: string;

  @IsString()
  @Length(3, 128, {
    message: "Passwords should contain 3-64 symbols",
  })
  @Matches(/^\S+$/, {
    message: "Password can't contain whitespaces",
  })
  public password: string;
}
