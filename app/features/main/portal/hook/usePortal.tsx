import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { PortalSchema, PortalCreateSchema } from "../validate/portalSchema";
import { useToast } from "@/app/components/ui/toast/use-toast";
import { setCookie } from "@/libs/cookie";
import { usePortalStore } from "@/store/portal/portalStore";
import {
  IAccessTokenRequest,
  IGetPortalResponse,
} from "@/types/portalType";
import { EHttpStatusCode } from "@/types/enum";

export default function usePortal() {
  // local state
  const [portalData, setPortalData] = useState<IAccessTokenRequest>({
    portal_id: "",
  });
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const { createToken, getPortal } = usePortalStore();

  //hooks
  const router = useRouter();
  const { toast } = useToast();

  // Functions
  const handlePortal = async (data?: IAccessTokenRequest) => {
    const dataToUse = data || portalData;
    try {
      await PortalSchema.parseAsync({
        portal_id: dataToUse.portal_id,
      });
      const response = await createToken(dataToUse);
      if (response.statusCode === EHttpStatusCode.SUCCESS) {
        toast({
          icon: "ToastSuccess",
          variant: "success",
          description: "Login Successfully.",
        });
        setCookie("accessToken", response.access_token);
        router.push("/menu");
      } else {
        toast({
          icon: "ToastError",
          variant: "error",
          description: "Incorrect portal ID. Please try again.",
        });
        router.push("/not-found");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(err.errors);
      } else {
        toast({
          icon: "ToastError",
          variant: "error",
          description: "Incorrect portal ID. Please try again.",
        });
        router.push("/not-found");
      }
    }
  };

  const handleGetPortal = async () => {
    try {
      const response = await getPortal();
      if (response.statusCode === EHttpStatusCode.SUCCESS) {
        toast({
          icon: "ToastSuccess",
          variant: "success",
          description: "Portal Get Successfully.",
        });
        return response;
      } else {
        toast({
          icon: "ToastError",
          variant: "error",
          description: "Failed to get portal. Please try again.",
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(err.errors);
      } else {
        toast({
          icon: "ToastError",
          variant: "error",
          description: "Failed to get portal. Please try again.",
        });
      }
    }
  };

  const getError = (field: string) => {
    return errors.find((error) => error.path[0] === field)?.message;
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => prev.filter((error) => error.path[0] !== field));
  };
  return {
    portalData,
    setPortalData,
    handlePortal,
    handleGetPortal,
    getError,
    clearFieldError,
  };
}
