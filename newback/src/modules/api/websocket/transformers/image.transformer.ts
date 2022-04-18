import type {ImageModel} from "@/data/model/image.model";
import type {MessageModel} from "@/data/model/message.model";
import type {FileModelDto} from "@/data/types/frontend";
import type {PureModel,} from "@/data/types/internal";

export function getFiles(images: PureModel<ImageModel>[], mess: PureModel<MessageModel>): Record<number, FileModelDto> {
  return Object.fromEntries(images.filter((img) => img.messageId === mess.id).map((img) => [
    img.symbol, {
      url: img.img,
      type: img.type,
      preview: img.preview,
      id: img.id,
    },
  ]));
}

export function transformGetImages(resImages: PureModel<ImageModel>[]): Record<number, FileModelDto> {
  return Object.fromEntries(resImages.map((value) => [
    value.symbol, {
      id: value.id,
      type: value.type,
      url: value.img,
      preview: value.preview,
    },
  ]));
}
