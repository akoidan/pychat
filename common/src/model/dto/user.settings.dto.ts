import {LogLevel} from 'lines-logger';

export interface UserSettingsDto {
  embeddedYoutube: boolean;
  highlightCode: boolean;
  incomingFileCallSound: boolean;
  messageSound: boolean;
  onlineChangeSound: boolean;
  showWhenITyping: boolean;
  suggestions: boolean;
  logs: LogLevel;
  theme: string;
}
