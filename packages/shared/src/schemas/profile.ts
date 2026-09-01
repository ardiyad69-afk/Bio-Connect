import { z } from "zod";
import { usernameSchema } from "./username";

export const socialsSchema = z
  .object({
    instagram: z.string().trim().max(100).optional(),
    twitter: z.string().trim().max(100).optional(),
    tiktok: z.string().trim().max(100).optional(),
    youtube: z.string().trim().max(100).optional(),
    github: z.string().trim().max(100).optional(),
    linkedin: z.string().trim().max(100).optional(),
  })
  .partial();
export type Socials = z.infer<typeof socialsSchema>;

export const themeColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Theme color harus hex 6 digit, mis. #7c3aed");

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(280).optional(),
  avatarUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  themeColor: themeColorSchema.optional(),
  socials: socialsSchema.optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const checkUsernameSchema = z.object({
  u: usernameSchema,
});
