import {UserSettingsDto} from '@common/model/dto/user.settings.dto';
import type {UserModel} from "@/data/model/user.model";


export function transformSettings(user: UserModel): UserSettingsDto {
  return {
    embeddedYoutube: Boolean(user.userSettings.embeddedYoutube),
    highlightCode: Boolean(user.userSettings.highlightCode),
    incomingFileCallSound: Boolean(user.userSettings.incomingFileCallSound),
    messageSound: Boolean(user.userSettings.messageSound),
    onlineChangeSound: Boolean(user.userSettings.onlineChangeSound),
    showWhenITyping: Boolean(user.userSettings.showWhenITyping),
    suggestions: Boolean(user.userSettings.suggestions),
    theme: user.userSettings.theme,
    logs: user.userSettings.logs,
  };
}
