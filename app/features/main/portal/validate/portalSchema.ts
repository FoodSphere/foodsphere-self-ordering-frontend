import { z } from "zod";

export const PortalSchema = z.object({
  portal_id: z.string(),
});