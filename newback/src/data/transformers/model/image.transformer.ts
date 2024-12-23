import {ImageType} from '@common/model/enum/image.type';
import {FileModelDto} from '@common/model/dto/file.model.dto';
import type {ImageModel} from "@/data/model/image.model";
import type {MessageModel} from "@/data/model/message.model";
import type {PureModel} from "@/data/types/internal";


export function getUrl(value: PureModel<ImageModel>, attribute: "img" | "preview") {
  return value.type === ImageType.GIPHY ? value.img : `/photo/${value[attribute]}`;
}

export function transformSingleImageDto(value: PureModel<ImageModel>): FileModelDto {
  return {
    id: value.id,
    type: value.type,
    url: getUrl(value, "img"),
    preview: getUrl(value, "preview"),
  };
}

export function transformImageByPickingDto(images: PureModel<ImageModel>[], mess: PureModel<MessageModel>): Record<number, FileModelDto> {
  return Object.fromEntries(images.filter((img) => img.messageId === mess.id).map((img) => [img.symbol, transformSingleImageDto(img)]));
}

export function transformImageDto(resImages: PureModel<ImageModel>[]): Record<number, FileModelDto> {
  return Object.fromEntries(resImages.map((value) => [value.symbol, transformSingleImageDto(value)]));
}
