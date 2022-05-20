export interface WebRtcDefaultMessage {
  connId: string;
}

export interface OpponentWsId {
  opponentWsId: string;
}

export interface ReplyWebRtc extends WebRtcDefaultMessage, OpponentWsId {
  content: BrowserBase;
  userId: number;
}

export type CallStatus =
  "accepted"
  | "not_inited"
  | "received_offer"
  | "sent_offer";


export interface BrowserBase {
  browser: string;
}


