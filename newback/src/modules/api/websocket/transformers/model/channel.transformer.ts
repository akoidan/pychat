import {ChannelModel} from '@/data/model/channel.model';
import {ChannelDto} from '@/data/types/frontend';

export function transformChannelDto(c: ChannelModel): ChannelDto {
  return {
    name: c.name,
    id: c.id,
    creatorId: c.creatorId,
  };
}
