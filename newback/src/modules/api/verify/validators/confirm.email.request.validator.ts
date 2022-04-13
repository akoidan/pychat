import {IsString,} from 'class-validator';
import {ConfirmEmailRequest} from '@/data/types/frontend';


export class ConfirmEmailRequestValidator implements ConfirmEmailRequest {
  @IsString()
  public token: string;
}
