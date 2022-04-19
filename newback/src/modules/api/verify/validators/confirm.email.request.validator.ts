import {IsString} from "class-validator";
import { ConfirmEmailRequest } from '@/data/shared/http';


export class ConfirmEmailRequestValidator implements ConfirmEmailRequest {
  @IsString()
  public token: string;
}
