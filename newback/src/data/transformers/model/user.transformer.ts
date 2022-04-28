import type {UserModel} from "@/data/model/user.model";



export function transformUserDto(u: UserModel): UserDto {
  return {
    username: u.username,
    id: u.id,
    thumbnail: u.thumbnail,
    sex: u.sex,
    lastTimeOnline: u.lastTimeOnline,
  };
}
