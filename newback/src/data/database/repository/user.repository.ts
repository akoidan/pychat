import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {UserModel} from '@/data/database/model/user.model';
import {UserAuthModel} from '@/data/database/model/user.auth.model';
import {
  SignUpRequest,
  VerificationType
} from '@/data/types/dto/dto';
import {UserProfileModel} from '@/data/database/model/user.profile.model';
import {UserSettingsModel} from '@/data/database/model/user.settings.model';
import {VerificationModel} from '@/data/database/model/verification.model';
import {Transaction} from 'sequelize';


@Injectable()
export class UserRepository {
  public constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
    @InjectModel(UserAuthModel) private readonly userAuthModel: typeof UserAuthModel,
    @InjectModel(UserProfileModel) private readonly userProfileModel: typeof UserProfileModel,
    @InjectModel(UserSettingsModel) private readonly userSettingsModel: typeof UserSettingsModel,
    @InjectModel(VerificationModel) private readonly verificationModel: typeof VerificationModel,
  ) {
  }

  public async createUser(data: SignUpRequest, transaction: Transaction): Promise<number> {
    let userModel = await this.userModel.create({
      username: data.username,
      lastTimeOnline: new Date(),
      sex: data.sex
    }, {transaction})
    await Promise.all([
      this.userProfileModel.create({
        id: userModel.id
      }, {transaction}),
      this.userAuthModel.create({
        password: data.password,
        email: data.email,
        id: userModel.id
      }, {transaction}),
      this.userSettingsModel.create({
        id: userModel.id
      }, {transaction})
    ])
    return userModel.id;
  }

  public async checkUserExistByUserName(username: string, transaction?: Transaction): Promise<boolean> {
    return await this.userModel.findOne({
      where: {username},
      transaction
    }) != null
  }

  public async createVerification(email: string, userId: number, token: string, transaction?: Transaction): Promise<void> {
    let verification = await this.verificationModel.create({
      type: VerificationType.REGISTER,
      email,
      userId,
      token,
    }, {
      transaction
    });
    await this.userAuthModel.update({
      emailVerificationId: verification.id,
    }, {
      where: {
        id: userId,
      },
      transaction
    })
  }

  public async checkUserExistByEmail(email: string): Promise<boolean> {
    return await this.userAuthModel.findOne({
      where: {email},
    }) != null
  }

  public async getUserByEmail(email: string): Promise<UserAuthModel | null> {
    return this.userAuthModel.findOne({
      where: {email},
      include: [
        'user', // LEFT OUTER JOIN "id" = "user"."id"
      ],
    })
  }

}
