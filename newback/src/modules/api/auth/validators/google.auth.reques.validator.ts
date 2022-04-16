import {IsString} from "class-validator";
import type {GoogleAuthRequest} from "@/data/types/frontend";

export class GoogleAuthRequestValidator implements GoogleAuthRequest {
  @IsString()
  public token: string;
}
