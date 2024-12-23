import {DefaultWsInMessage} from "@common/ws/common";

export interface SetProfileImageWsInBody {
  url: string;
}
export type SetProfileImageWsInMessage = DefaultWsInMessage<"setProfileImage", "ws", SetProfileImageWsInBody>;
