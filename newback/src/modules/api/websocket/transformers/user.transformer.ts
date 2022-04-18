import {UserModel} from '@/data/model/user.model';
import {UserDto} from '@/data/types/frontend';


export function transformUserDto(u: UserModel): UserDto {
  return {
    username: u.username,
    id: u.id,
    thumbnail: u.thumbnail,
    sex: u.sex,
    lastTimeOnline: u.lastTimeOnline,
  };
}
