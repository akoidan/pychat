import type {UploadedFileModel} from "@/data/model/uploaded.file.model";
import {
  ALL_ROOM_ID,
  MAX_USERNAME_LENGTH,
} from "@/data/consts";
import type {FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import type {FaceBookAuthRequest} from "@common/http/auth/facebook.auth";
import type {GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import type {GoogleAuthRequest} from "@common/http/auth/google.auth";
import type {
  SignUpRequest,
  SignUpResponse,
} from "@common/http/auth/sign.up";
import type {
  SignInRequest,
  SignInResponse,
} from "@common/http/auth/sign.in";
import {ImageType} from '@common/model/enum/image.type';
import {Gender} from '@common/model/enum/gender';
import {MessageStatus} from '@common/model/enum/message.status';
import {Theme} from '@common/model/enum/theme';
import {VerificationType} from '@common/model/enum/verification.type';
import {GiphyDto} from '@common/model/dto/giphy.dto';
import {ChannelDto} from '@common/model/dto/channel.dto';
import {FileModelDto} from '@common/model/dto/file.model.dto';
import {LocationDto} from '@common/model/dto/location.dto';
import {MessageModelDto} from '@common/model/dto/message.model.dto';
import {RoomDto} from '@common/model/dto/room.dto';
import {UserDto} from '@common/model/dto/user.dto';
import {UserProfileDto} from '@common/model/dto/user.profile.dto';
import {UserSettingsDto} from '@common/model/dto/user.settings.dto';


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
