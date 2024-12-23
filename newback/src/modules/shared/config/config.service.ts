import {Injectable} from "@nestjs/common";
import type {config as Blah} from "node-ts-config";

@Injectable()
export class ConfigService {
  constructor(private readonly config: typeof Blah) {
  }

  public getConfig(): typeof Blah {
    return this.config;
  }
}
