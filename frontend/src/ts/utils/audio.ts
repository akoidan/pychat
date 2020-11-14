import ChatCall from '@/assets/sounds/Call.mp3';
import ChatIncoming from '@/assets/sounds/ChatIncoming.wav';
import ChatLogin from '@/assets/sounds/ChatLogin.wav';
import ChatLogout from '@/assets/sounds/ChatLogout.wav';
import ChatOutgoing from '@/assets/sounds/ChatOutgoing.wav';
import ChatFile from '@/assets/sounds/File.mp3';

export const call = new Audio(<any>ChatCall);
export const incoming = new Audio(<any>ChatIncoming);
export const login = new Audio(<any>ChatLogin);
export const logout = new Audio(<any>ChatLogout);
export const outgoing = new Audio(<any>ChatOutgoing);
export const file = new Audio(<any>ChatFile);