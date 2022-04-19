import {UploadedFileModel} from '@/data/model/uploaded.file.model';
import { GiphyDto } from '@/data/shared/dto';


export function getMaxSymbol(files: UploadedFileModel[], tags: Record<string, number>, giphies: GiphyDto[]) {
  const maxSymInt: number = Math.max(
    0,
    ...files.map((f) => f.symbol.charCodeAt(0)),
    ...Object.keys(tags).map((k) => k.charCodeAt(0)),
    ...giphies.map((g) => g.symbol.charCodeAt(0))
  );
  const symbol: string | null = maxSymInt === 0 ? null : String.fromCharCode(maxSymInt);
  return symbol;
}
