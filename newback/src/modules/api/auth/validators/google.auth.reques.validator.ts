

import {IsString,} from 'class-validator';
import {GoogleAuthRequest} from '@/data/types/dto/dto';

export class GoogleAuthRequestValidator implements GoogleAuthRequest {

  @IsString()
  public token: string;

}
