import type {UploadedFileModel} from "@/data/model/uploaded.file.model";
import type {ImageModel} from "@/data/model/image.model";
import {ImageType} from "@/data/types/frontend";

export function groupUploadedFileToImages(files: UploadedFileModel[], messageId: number): Partial<ImageModel>[] {
  const grouped: Record<string, Partial<ImageModel>> = files.reduce<Record<string, Partial<ImageModel>>>((previousValue, currentValue) => {
    const existingElement = previousValue[currentValue.symbol];
    if (!existingElement) {
      previousValue[currentValue.symbol] = {
        messageId,
        symbol: currentValue.symbol,
      };
    }
    if (currentValue.type === ImageType.PREVIEW) {
      previousValue[currentValue.symbol].preview = currentValue.file;
    } else {
      previousValue[currentValue.symbol].type = currentValue.type;
      previousValue[currentValue.symbol].img = currentValue.file;
    }
    return previousValue;
  }, {});
  return Object.values(grouped);
}
