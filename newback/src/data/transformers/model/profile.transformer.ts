import {UserModel} from '@/data/model/user.model';
import { UserProfileDto } from '@/data/shared/dto';

export function transformProfileDto(user: UserModel): UserProfileDto {
  return {
    username: user.username,
    name: user.userProfile.name,
    sex: user.sex,
    id: user.id,
    city: user.userProfile.city,
    email: user.userAuth.email,
    birthday: user.userProfile.birthday,
    contacts: user.userProfile.contacts,
    surname: user.userProfile.surname,
    thumbnail: user.thumbnail,
  };
}
