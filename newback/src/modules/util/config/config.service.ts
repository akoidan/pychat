import {Injectable} from '@nestjs/common';
import type {IConfig} from 'node-ts-config';

@Injectable()
export class ConfigService {

  constructor(private readonly config: IConfig) {
  }

  public getConfig(): IConfig {
    return this.config;
  }

}
