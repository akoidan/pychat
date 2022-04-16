import {IsString} from "class-validator";
import type {VerifyTokenRequest} from "@/data/types/frontend";


export class VerifyTokenRequestValidator implements VerifyTokenRequest {
  @IsString()
  public token: string;
}
