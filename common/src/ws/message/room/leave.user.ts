import type {DefaultWsInMessage} from "@common/ws/common";

export interface LeaveUserWsInBody {
  roomId: number;
  userId: number;
  users: number[];
}

export type LeaveUserWsInMessage = DefaultWsInMessage<"leaveUser", "room", LeaveUserWsInBody>;
