import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {RoomModel} from '@/data/model/room.model';
import {RoomUsersModel} from '@/data/model/room.users.model';
import {Transaction} from 'sequelize';
import {IpAddressModel} from '@/data/model/ip.address.model';


@Injectable()
export class IpRepository {
  public constructor(
    @InjectModel(IpAddressModel) private readonly ipAddressModel: typeof IpAddressModel,
  ) {
  }

  public async saveIP(model: Partial<IpAddressModel>) {
    return this.ipAddressModel.upsert(model);
  }

  public async getIp(ip: string): Promise<IpAddressModel> {
    return this.ipAddressModel.findOne({
      where: {
        ip
      }
    });
  }
}
