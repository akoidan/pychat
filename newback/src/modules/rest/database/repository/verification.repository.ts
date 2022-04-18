import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {UserAuthModel} from "@/data/model/user.auth.model";
import type {VerificationType} from "@/data/types/frontend";
import {VerificationModel} from "@/data/model/verification.model";
import type {Transaction} from "sequelize";
import {
  CreateModel,
  RequireAtLeastOne
} from '@/data/types/internal';


@Injectable()
export class VerificationRepository {
  public constructor(
    @InjectModel(UserAuthModel) private readonly userAuthModel: typeof UserAuthModel,
    @InjectModel(VerificationModel) private readonly verificationModel: typeof VerificationModel,
  ) {
  }

  public async markVerificationVerified(id: number, transaction: Transaction) {
    await this.verificationModel.update({verified: true}, {
      where: {id},
      transaction,
    });
  }

  public async setUserVerification(userId: number, emailVerificationId: number, transaction: Transaction) {
    await this.userAuthModel.update({emailVerificationId}, {
      where: {id: userId},
      transaction,
    });
  }


  public async getVerification(token: string, transaction?: Transaction): Promise<VerificationModel> {
    return this.verificationModel.findOne({
      where: {token},
      include: ["user"],
      raw: true,
      transaction,
    });
  }

  public async createVerification(data: RequireAtLeastOne<CreateModel<VerificationModel>, 'userId'>, transaction: Transaction): Promise<void> {
    const verification = await this.verificationModel.create(data, {
      raw: true,
      transaction,
    });
    await this.userAuthModel.update({
      emailVerificationId: verification.id,
    }, {
      where: {
        id: data.userId,
      },
      transaction,
    });
  }
}
