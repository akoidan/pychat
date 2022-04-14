import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {IpAddressModel} from '@/data/model/ip.address.model';
import {UserJoinedInfoModel} from '@/data/model/user.joined.info.model';


@Injectable()
export class IpRepository {
  public constructor(
    @InjectModel(IpAddressModel) private readonly ipAddressModel: typeof IpAddressModel,
    @InjectModel(UserJoinedInfoModel) private readonly userJoinedInfoModel: typeof UserJoinedInfoModel,
  ) {
  }

  public async saveIpToUser(userId: number, ipId: number) {
    await this.userJoinedInfoModel.upsert({userId, ipId},);
  }

  public async saveIP(model: Partial<IpAddressModel>) {
    return this.ipAddressModel.upsert(model);
  }

  public async getIp(ip: string): Promise<IpAddressModel> {
    return this.ipAddressModel.findOne({
      where: {
        ip
      },
      raw: true
    });
  }
}
