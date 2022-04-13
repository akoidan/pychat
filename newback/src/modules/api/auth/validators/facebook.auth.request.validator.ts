import {IsString} from 'class-validator';
import {FaceBookAuthRequest,} from '@/data/types/frontend';

export class FacebookAuthRequestValidator implements FaceBookAuthRequest {

  @IsString()
  public token: string;

}
