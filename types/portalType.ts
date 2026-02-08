import { IBaseResponse } from "./globalType";

export interface IPortalData {
  portal_id: string;
}

export interface IPortalResponse extends IBaseResponse {
  access_token: string;
}