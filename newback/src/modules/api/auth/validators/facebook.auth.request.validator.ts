import {IsString} from "class-validator";
import type {FaceBookAuthRequest} from "@/data/types/frontend";

export class FacebookAuthRequestValidator implements FaceBookAuthRequest {
  @IsString()
  public token: string;
}
