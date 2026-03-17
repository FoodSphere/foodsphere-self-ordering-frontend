import { IBaseResponse } from "./globalType";

export interface IAccessTokenRequest {
  portal_id: string;
}

export interface IAccessTokenResponse extends IBaseResponse {
  access_token: string;
}

export interface IGetPortalResponse extends IBaseResponse {
  id: string;
  bill_id: string;
  create_time: string;
  update_time: string;
  max_usage: number;
  usage_count: number;
  valid_duration: string | null;
}
