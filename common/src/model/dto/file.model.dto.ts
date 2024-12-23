import type {ImageType} from "@common/model/enum/image.type";

export interface FileModelDto {
  url: string;
  id: number;
  type: ImageType;
  preview: string;
}
