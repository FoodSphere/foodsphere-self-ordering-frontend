import { apiPost } from "../common";
import { IPortalData, IPortalResponse } from "@/types/portalType";

export const portalApi = {
  createToken: async (portalData: IPortalData): Promise<IPortalResponse> => {
    const res = await apiPost("/auth/token", portalData);
    const portalResponse: IPortalResponse = {
      statusCode: res.statusCode,
      message: res.message,
      access_token: res.data.access_token,
    };
    return portalResponse;
  },
};