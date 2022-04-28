import {Gender} from '@common/model/enum/gender';

export interface UserDto {
  username: string;
  id: number;
  thumbnail: string;
  lastTimeOnline: number;
  sex: Gender;
}
