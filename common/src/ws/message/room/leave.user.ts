import type {DefaultWsInMessage} from "@common/ws/common";

export interface LeaveUserBody {
  roomId: number;
  userId: number;
  users: number[];
}

export type LeaveUserMessage = DefaultWsInMessage<"leaveUser", "room", LeaveUserBody>;
