import {IsString} from "class-validator";
import { GoogleAuthRequest } from '@/data/shared/http';

export class GoogleAuthRequestValidator implements GoogleAuthRequest {
  @IsString()
  public token: string;
}
