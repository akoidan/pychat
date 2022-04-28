import {IsString} from "class-validator";
import {GoogleAuthRequest} from '@common/http/auth/google.auth';


export class GoogleAuthRequestValidator implements GoogleAuthRequest {
  @IsString()
  public token: string;
}
