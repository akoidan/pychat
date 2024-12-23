import type {
  RequestWsOutMessage,
  ResponseWsInMessage,
} from "@common/ws/common";
import type {LocationDto} from "@common/model/dto/location.dto";

export type GetCountryCodeWsOutMessage = RequestWsOutMessage<"getCountryCode", null>;

export interface GetCountryCodeWsInBody {
  userLocation: Record<string, LocationDto>;
}

export type GetCountryCodeWsInMessage = ResponseWsInMessage<GetCountryCodeWsInBody>;
