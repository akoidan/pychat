import type {
  DefaultWsInMessage,
  RequestWsOutMessage,
  ResponseWsInMessage
} from "@common/ws/common";
import type {UserSettingsDto} from "@common/model/dto/user.settings.dto";
import {MultiResponseMessage} from "@common/ws/common";

export type SetSettingBody = UserSettingsDto;
export type SetSettingsMessage = MultiResponseMessage<"setSettings", "ws", SetSettingBody>;
export type SetSettingsWsOutMessage = RequestWsOutMessage<"setSettings", SetSettingBody>
