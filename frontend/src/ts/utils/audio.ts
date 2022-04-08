import ChatCall from "@/assets/sounds/Call.mp3";
import ChatIncoming from "@/assets/sounds/ChatIncoming.wav";
import ChatLogin from "@/assets/sounds/ChatLogin.wav";
import ChatLogout from "@/assets/sounds/ChatLogout.wav";
import ChatOutgoing from "@/assets/sounds/ChatOutgoing.wav";
import ChatFile from "@/assets/sounds/File.mp3";


function createAudio(url: string) {
  const audio = new Audio();
  audio.preload = "none";
  audio.src = url;
  return audio;
}

export const call = createAudio(ChatCall);
export const incoming = createAudio(ChatIncoming);
export const login = createAudio(ChatLogin);
export const logout = createAudio(ChatLogout);
export const outgoing = createAudio(ChatOutgoing);
export const file = createAudio(ChatFile);
