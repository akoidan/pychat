import {ImageType} from '@common/model/enum/image.type';

export interface SaveFileResponse {
  id: number;
  previewId?: number;
  symbol: string;
}

export interface SaveFileRequest {
  file: Blob;
  name?: string;
  symbol: string;
  type: ImageType;
}
