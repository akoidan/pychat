export interface FacebookGetUserResponse {
  first_name: string;
  last_name: string;
  id: string;
}

export interface IpFailedInfoResponse {
  message: string;
  status: "fail";
}

export interface IpSuccessInfoResponse {
  status: "success";
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

export type IpInfoResponse =
  IpFailedInfoResponse
  | IpSuccessInfoResponse;
