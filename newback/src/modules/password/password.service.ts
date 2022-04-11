import {Injectable} from '@nestjs/common';
import {
  compare,
  hash
} from 'bcrypt';

@Injectable()
export class PasswordService {
  public constructor() {
  }

  public async createPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  public async generateRandomString(length: number): Promise<string> {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        characters.length));
    }
    return result;
  }

  public async checkPassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
