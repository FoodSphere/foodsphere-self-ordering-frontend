import { z } from "zod";

export const PortalSchema = z.object({
  portal_id: z.string(),
});

export const PortalCreateSchema = z.object({
  max_usage: z.number(),
  valid_duration: z.string().nullable(),
});