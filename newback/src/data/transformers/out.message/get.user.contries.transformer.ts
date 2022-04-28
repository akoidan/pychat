import {LocationDto} from '@common/model/dto/location.dto';
import type {UserJoinedInfoModel} from "@/data/model/user.joined.info.model";


export function transformUserCountries(userInfo: UserJoinedInfoModel[]): Omit<GetCountryCodeWsInMessage, "action" | "handler"> {
  const content: GetCountryCodeWsInMessage["content"] = userInfo.reduce((previousValue, currentValue) => {
    if (currentValue.ip) {
      const value: LocationDto = {
        country: currentValue.ip.country,
        region: currentValue.ip.region,
        city: currentValue.ip.city,
        countryCode: currentValue.ip.countryCode,
      };
      previousValue[currentValue.userId] = value;
    }
    return previousValue;
  }, {});
  return {content};
}
