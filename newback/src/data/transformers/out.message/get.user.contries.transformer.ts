import type {LocationDto} from "@common/model/dto/location.dto";
import type {GetCountryCodeWsInMessage} from "@common/ws/message/get.country.code";;
import type {UserJoinedInfoModel} from "@/data/model/user.joined.info.model";


export function transformUserCountries(userInfo: UserJoinedInfoModel[]): GetCountryCodeWsInMessage["data"] {
  const userLocation: GetCountryCodeWsInMessage["data"]["userLocation"] = userInfo.reduce((previousValue, currentValue) => {
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
  return {userLocation};
}
