import {ChannelModel} from '@/data/model/channel.model';
import {ChannelDto} from '@/data/types/frontend';

export function transformChannelsDto(c: ChannelModel): ChannelDto {
  return {
    name: c.name,
    id: c.id,
    creatorId: c.creatorId,
  };
}
