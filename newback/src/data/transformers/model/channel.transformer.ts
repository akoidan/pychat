import {ChannelDto} from '@common/model/dto/channel.dto';
import type {ChannelModel} from "@/data/model/channel.model";


export function transformChannelDto(c: ChannelModel): ChannelDto {
  return {
    name: c.name,
    id: c.id,
    creatorId: c.creatorId,
  };
}
