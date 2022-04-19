import {IsString} from "class-validator";
import { VerifyTokenRequest } from '@/data/shared/http';


export class VerifyTokenRequestValidator implements VerifyTokenRequest {
  @IsString()
  public token: string;
}
