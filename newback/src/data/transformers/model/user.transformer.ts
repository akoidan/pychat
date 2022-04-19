import {UserModel} from '@/data/model/user.model';
import { UserDto } from '@/data/shared/dto';


export function transformUserDto(u: UserModel): UserDto {
  return {
    username: u.username,
    id: u.id,
    thumbnail: u.thumbnail,
    sex: u.sex,
    lastTimeOnline: u.lastTimeOnline,
  };
}
