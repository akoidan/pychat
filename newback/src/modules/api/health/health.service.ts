import {
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import {Sequelize} from "sequelize-typescript";

import {HealthRepository} from "@/modules/shared/database/repository/health.repository";
import type {HealthResponse} from "@/data/types/api";

@Injectable()
export class HealthService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly healthRepo: HealthRepository,
  ) {
  }


  public async checkHealth(): Promise<HealthResponse> {
    const tables = await this.healthRepo.getTables();
    const numberOfModels: number = Object.values(this.sequelize.models).length;
    // +1 is a migration table
    if (tables.length !== numberOfModels + 1) {
      throw new InternalServerErrorException(
        `Database migration is not finished. Expected ${numberOfModels} tables, but found ${tables.length}`
      );
    }
    return {
      tables: tables.length,
    };
  }
}
