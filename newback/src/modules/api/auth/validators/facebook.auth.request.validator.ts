import {IsString} from "class-validator";
import { FaceBookAuthRequest } from '@/data/shared/http';

export class FacebookAuthRequestValidator implements FaceBookAuthRequest {
  @IsString()
  public token: string;
}
