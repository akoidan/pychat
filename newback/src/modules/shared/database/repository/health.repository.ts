import {Injectable} from "@nestjs/common";
import {Sequelize} from "sequelize-typescript";


@Injectable()
export class HealthRepository {
  public constructor(
    private readonly sequelize: Sequelize,
  ) {
  }

  public async getTables(): Promise<string[]> {
    const tables: Record<string, string>[] = await this.sequelize.query("show tables") as Record<string, string>[];
    return tables.map((t) => Object.values(t)[0]);
  }
}
