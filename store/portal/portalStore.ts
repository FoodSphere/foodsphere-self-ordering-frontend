import { create } from "zustand";

import { portalApi } from "@/services/portal/portalApi";
import { IPortalData, IPortalResponse } from "@/types/portalType";

type portalStore = {
  //login State
  portalResponse: IPortalResponse | null;

  // API login
  createToken: (portalData: IPortalData) => Promise<IPortalResponse>;
};

export const usePortalStore = create<portalStore>(() => ({
  portalResponse: null,
  createToken: async (portalData: IPortalData): Promise<IPortalResponse> => {
    const response = await portalApi.createToken(portalData);
    return response;
  },
}));