import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {IpAddressModel} from "@/data/model/ip.address.model";
import {UserJoinedInfoModel} from "@/data/model/user.joined.info.model";
import {Op} from "sequelize";
import {CreateModel} from '@/data/types/internal';


@Injectable()
export class IpRepository {
  public constructor(
    @InjectModel(IpAddressModel) private readonly ipAddressModel: typeof IpAddressModel,
    @InjectModel(UserJoinedInfoModel) private readonly userJoinedInfoModel: typeof UserJoinedInfoModel,
  ) {
  }

  public async saveIpToUser(userId: number, ipId: number) {
    await this.userJoinedInfoModel.upsert({
      userId,
      ipId,
    });
  }

  public connectCreateHook(cb: () => Promise<void>) {
    this.ipAddressModel.afterBulkCreate(cb);
    this.ipAddressModel.afterCreate(cb);
    this.userJoinedInfoModel.afterBulkCreate(cb);
    this.userJoinedInfoModel.afterBulkCreate(cb);
    this.userJoinedInfoModel.afterUpdate(cb);
    this.userJoinedInfoModel.afterBulkUpdate(cb);
  }

  public saveIP(model: CreateModel<IpAddressModel>): Promise<IpAddressModel> {
    return this.ipAddressModel.upsert(model)[0];
  }

  public async getIp(ip: string): Promise<IpAddressModel> {
    return this.ipAddressModel.findOne({
      where: {
        ip,
      },
      raw: true,
    });
  }

  public async getAllIps(): Promise<UserJoinedInfoModel[]> {
    return this.userJoinedInfoModel.findAll({
      raw: true,
      include: ["ip"],
    });
  }

  public async getIpInfosForUsers(userIds: number[]): Promise<UserJoinedInfoModel[]> {
    return this.userJoinedInfoModel.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
      raw: true,
      include: ["ip"],
    });
  }
}
