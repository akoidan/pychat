import type {DefaultWsInMessage} from "@common/ws/common";
import type {UserSettingsDto} from "@common/model/dto/user.settings.dto";

export type SetSettingBody = UserSettingsDto;
export type SetSettingsMessage = DefaultWsInMessage<"setSettings", "ws", SetSettingBody>;
