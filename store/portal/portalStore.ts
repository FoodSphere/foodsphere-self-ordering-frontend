import { create } from "zustand";

import { portalApi } from "@/services/portal/portalApi";
import { IAccessTokenRequest, IAccessTokenResponse, IGetPortalResponse } from "@/types/portalType";

type portalStore = {
  //login State
  portalResponse: IAccessTokenResponse | null;
  portalGetResponse: IGetPortalResponse | null;

  // API login
  createToken: (portalData: IAccessTokenRequest) => Promise<IAccessTokenResponse>;
  getPortal: () => Promise<IGetPortalResponse>;
};

export const usePortalStore = create<portalStore>(() => ({
  portalResponse: null,
  portalGetResponse: null,
  createToken: async (portalData: IAccessTokenRequest): Promise<IAccessTokenResponse> => {
    const response = await portalApi.createToken(portalData);
    return response;
  },
  getPortal: async (): Promise<IGetPortalResponse> => {
    const response = await portalApi.getPortal();
    return response;
  },
}));