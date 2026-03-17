import { EHttpStatusCode } from "@/types/enum";
import { apiPost, apiGet } from "../common";
import { IAccessTokenRequest, IAccessTokenResponse, IGetPortalResponse } from "@/types/portalType";

export const portalApi = {
  createToken: async (portalData: IAccessTokenRequest): Promise<IAccessTokenResponse> => {
    const res = await apiPost("/auth/token", portalData);
    const portalResponse: IAccessTokenResponse = {
      statusCode: res?.statusCode || EHttpStatusCode.NOT_FOUND,
      message: res?.message || {
        th: "",
        en: "",
      },
      access_token: res?.data?.access_token || "",
    };
    return portalResponse;
  },
  getPortal: async (): Promise<IGetPortalResponse> => {
    const res = await apiGet("/portals");
    const portalResponse: IGetPortalResponse = {
      statusCode: res?.statusCode || EHttpStatusCode.NOT_FOUND,
      message: res?.message || {
        th: "",
        en: "",
      },
      id: res?.data[0].id || "",
      bill_id: res?.data[0].bill_id || "",
      create_time: res?.data[0].create_time || "",
      update_time: res?.data[0].update_time || "",
      max_usage: res?.data[0].max_usage || 0,
      usage_count: res?.data[0].usage_count || 0,
      valid_duration: res?.data[0].valid_duration || "",
    };
    return portalResponse;
  },
};