import {DefaultWsInMessage} from "@common/ws/common";

export interface SetProfileImageBody {
  url: string;
}
export type SetProfileImageMessage = DefaultWsInMessage<"setProfileImage", "ws", SetProfileImageBody>;
