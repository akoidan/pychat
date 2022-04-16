import {IsString} from "class-validator";
import type {ConfirmEmailRequest} from "@/data/types/frontend";


export class ConfirmEmailRequestValidator implements ConfirmEmailRequest {
  @IsString()
  public token: string;
}
