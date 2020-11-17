/**
 * This file should only contain interfaces is used to exchange structure in P2P rooms
 * So if we create a structure on one PC (on frontend) and handle on another (on frontend as well)
 * this file should do it
 */
import { WebRtcMessageModelDto } from '@/ts/types/dto';
import {
  UploadFile
} from '@/ts/types/types';
import {
  HandlerName,
} from '@/ts/types/messages/baseMessagesInterfaces';


export interface DefaultP2pMessage<A extends string>   {
  handler: HandlerName;
  action: A;
}

export interface PrintWebRtcMessage extends DefaultP2pMessage<'printMessage'>, WebRtcMessageModelDto {

}

export interface InnerSendMessage extends DefaultP2pMessage<'printMessage'> {
  content: string;
  id: number;
  uploadFiles: UploadFile[];
  originTime: number;
}