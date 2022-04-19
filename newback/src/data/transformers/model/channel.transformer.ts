import {ChannelModel} from '@/data/model/channel.model';
import { ChannelDto } from '@/data/shared/dto';


export function transformChannelDto(c: ChannelModel): ChannelDto {
  return {
    name: c.name,
    id: c.id,
    creatorId: c.creatorId,
  };
}
