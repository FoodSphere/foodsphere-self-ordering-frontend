import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { PortalSchema } from "../validate/portalSchema";
import { useToast } from "@/app/components/ui/toast/use-toast";
import { setCookie } from "@/libs/cookie";
import { usePortalStore } from "@/store/portal/portalStore";
import { IPortalData } from "@/types/portalType";
import { EHttpStatusCode } from "@/types/enum";

export default function usePortal() {
  // local state]
  const [portalData, setPortalData] = useState<IPortalData>({
    portal_id: "",
  });
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const { createToken } = usePortalStore();

  //hooks
  const router = useRouter();
  const { toast } = useToast();

  // Functions
  const handlePortal = async (data?: IPortalData) => {
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
    getError,
    clearFieldError,
  };
}
