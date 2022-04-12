

import {IsString,} from 'class-validator';
import {GoogleAuthRequest} from '@/data/types/frontend';

export class GoogleAuthRequestValidator implements GoogleAuthRequest {

  @IsString()
  public token: string;

}
