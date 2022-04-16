import {
  IsEmail,
  IsString,
  Matches,
  ValidateIf,
} from "class-validator";
import type {SendRestorePasswordRequest} from "@/data/types/frontend";

export class SendRestorePasswordValidator implements SendRestorePasswordRequest {
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
}
