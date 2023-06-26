import type {MessageMentionModel} from "@/data/model/message.mention.model";
import type {MessageModel} from "@/data/model/message.model";
import type {
  CreateModel,
  PureModel,
} from "@/data/types/internal";

export function transformMentionByPickingDto(mentions: CreateModel<MessageMentionModel>[], m: PureModel<MessageModel>): Record<string, number> {
  return mentions.filter((mention) => mention.messageId === m.id).reduce((mentions, mention) => {
    mentions[mention.symbol] = mention.userId;
    return mentions;
  }, {});
}

export function transformMentionDto(mentions: CreateModel<MessageMentionModel>[]): Record<string, number> {
  return mentions.reduce<Record<string, number>>((previousValue, currentValue) => {
    previousValue[currentValue.symbol] = currentValue.userId;
    return previousValue;
  }, {});
}
