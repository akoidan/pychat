import {MAX_USERNAME_LENGTH,} from "@/data/consts";
import {
  IsString,
  Length,
  Matches,
} from "class-validator";


export class ValidateUserRequestValidator implements ValidateUserRequest {
  @IsString()
  @Length(1, MAX_USERNAME_LENGTH, {
    message: `Username should be 1-${MAX_USERNAME_LENGTH} characters`,
  })
  @Matches(/^[a-zA-Z-_0-9]+$/, {
    message: "Username can only contain latin characters, numbers and symbols '-' '_'",
  })
  public username: string;
}
