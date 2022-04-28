import {IsString} from "class-validator";


export class FacebookAuthRequestValidator implements FaceBookAuthRequest {
  @IsString()
  public token: string;
}
