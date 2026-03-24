import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { PortalSchema } from "../validate/portalSchema";
import { useToast } from "@/app/components/ui/toast/use-toast";
import { setCookie } from "@/libs/cookie";
import { usePortalStore } from "@/store/portal/portalStore";
import { IAccessTokenRequest } from "@/types/portalType";
import { EHttpStatusCode } from "@/types/enum";

export default function usePortal() {
  // local state
  const [portalData, setPortalData] = useState<IAccessTokenRequest>({
    portal_id: "",
  });
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { createToken, getPortal } = usePortalStore();

  //hooks
  const router = useRouter();
  const { toast } = useToast();

  // Functions
  const handlePortal = async (data?: IAccessTokenRequest) => {
    const dataToUse = data || portalData;
    setIsLoading(true);
    try {
      await PortalSchema.parseAsync({
        portal_id: dataToUse.portal_id,
      });
      const response = await createToken(dataToUse);
      if (response.statusCode === EHttpStatusCode.SUCCESS) {
        setCookie("accessToken", response.access_token);

        // Add delay for ensuring handle portal state finished
        setTimeout(() => {
          toast({
            icon: "ToastSuccess",
            variant: "success",
            description: "Login Successfully.",
          });
          setIsLoading(false);
          router.push("/menu");
        }, 500);
      } else {
        setIsLoading(false);
        toast({
          icon: "ToastError",
          variant: "error",
          description: "Incorrect portal ID. Please try again.",
        });
        router.push("/not-found");
      }
    } catch (err) {
      setIsLoading(false);
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
    isLoading,
  };
}
