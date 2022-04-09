export interface LoginRequest {
  username: string;
  password: string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MessageStatus {
  ON_SERVER = 'ON_SERVER',
  READ = 'READ',
  RECEIVED = 'RECEIVED', //received
}
export enum Theme {
  COLOR_LOR = 'color-lor',
  COLOR_REG = 'color-reg',
  COLOR_WHITE = 'color-white'
}
