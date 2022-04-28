import {Gender} from '@common/model/enum/gender';

export interface UserProfileDtoWoImage {
  username: string;
  name: string;
  city: string;
  surname: string;
  email: string;
  birthday: Date;
  contacts: string;
  sex: Gender;
  id: number;
}

export interface UserProfileDto extends UserProfileDtoWoImage {
  thumbnail: string;
}
