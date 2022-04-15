import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {UserModel} from '@/data/model/user.model';
import {UserAuthModel} from '@/data/model/user.auth.model';
import {Gender} from '@/data/types/frontend';
import {UserProfileModel} from '@/data/model/user.profile.model';
import {UserSettingsModel} from '@/data/model/user.settings.model';
import {
  Op,
  Transaction
} from 'sequelize';


@Injectable()
export class UserRepository {
  public constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
    @InjectModel(UserAuthModel) private readonly userAuthModel: typeof UserAuthModel,
    @InjectModel(UserProfileModel) private readonly userProfileModel: typeof UserProfileModel,
    @InjectModel(UserSettingsModel) private readonly userSettingsModel: typeof UserSettingsModel,
  ) {
  }

  public async updateUserPassword(userId: number, password: string, transaction: Transaction) {
    await this.userAuthModel.update({password}, {
      where: {id: userId},
      transaction,
    })
  }

  public async createUser(data: {
    username: string;
    password: string;
    email?: string;
    sex?: Gender;
    name?: string;
    surname?: string;
    thumbnail?: string;
    googleId?: string;
    facebookId?: string;
  }, transaction: Transaction): Promise<number> {
    let userModel = await this.userModel.create({
      username: data.username,
      lastTimeOnline: Date.now(),
      sex: data.sex,
      thumbnail: data.thumbnail
    }, {transaction, raw: true,})
    await Promise.all([
      this.userProfileModel.create({
        id: userModel.id,
      }, {transaction, raw: true,}),
      this.userAuthModel.create({
        password: data.password,
        email: data.email,
        id: userModel.id,
        googleId: data.googleId,
        facebookId: data.facebookId,
      }, {transaction, raw: true,}),
      this.userSettingsModel.create({
        id: userModel.id
      }, {transaction, raw: true,})
    ])
    return userModel.id;
  }

  public async getUserMyAuthGoogle(googleId: string, transaction: Transaction): Promise<UserAuthModel> {
    return this.userAuthModel.findOne({
      where: {
        googleId
      },
      raw: true,
      transaction
    })
  }

  public async getUserMyAuthFacebook(facebookId: string, transaction: Transaction): Promise<UserAuthModel> {
    return this.userAuthModel.findOne({
      where: {
        facebookId
      },
      raw: true,
      transaction
    })
  }

  public async checkUserExistByUserName(username: string, transaction?: Transaction): Promise<boolean> {
    return await this.userModel.findOne({
      where: {username},
      raw: true,
      transaction
    }) != null
  }

  public async checkUserExistByEmail(email: string): Promise<boolean> {
    return await this.userAuthModel.findOne({
      where: {email},
      raw: true,
    }) != null
  }

  public async getUserByEmail(email: string, transaction?: Transaction): Promise<UserAuthModel | null> {
    return this.userAuthModel.findOne({
      where: {email},
      raw: true,
      transaction,
      include: [
        'user', // LEFT OUTER JOIN "id" = "user"."id"
      ],
    })
  }

  public async getUserByUserName(username: string, includeFields: ('userAuth' | 'userProfile')[] = [], transaction?: Transaction): Promise<UserModel | null> {
    return this.userModel.findOne({
      where: {username},
      transaction,
      raw: true,
      include: includeFields,
    })
  }

  public async getById(id: number, includeFields: ('userAuth' | 'userProfile'| 'userSettings')[] = [], transaction?: Transaction): Promise<UserModel | null> {
    return this.userModel.findOne({
      where: {id},
      transaction,
      raw: true,
      include: includeFields,
    })
  }

  public async getUsersById(ids: number[], includeFields: ('userAuth' | 'userProfile' | 'userSettings')[] = []) {
    return this.userModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      raw: true,
      include: includeFields,
    })
  }

  public async setLastTimeOnline(userId: number, lastTimeOnline: number) {
    await this.userModel.update({
      lastTimeOnline
    }, {
      where: {
        id: userId
      }
    })
  }
}
