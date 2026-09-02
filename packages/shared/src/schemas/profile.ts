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

// The public bio page's visual template — distinct from `themeColor` (the
// accent color within a template) and from the app chrome's own dark/light
// toggle (unrelated: that's our product's UI, this is the creator's page).
export const profileThemeSchema = z.enum(["default", "neo-brutalism"]);
export type ProfileTheme = z.infer<typeof profileThemeSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(280).optional(),
  // 500 was sized for a hosted-image link; raised to fit a small avatar
  // pasted in as a data: URI too (base64 inflates ~33% over raw bytes —
  // 500_000 chars ≈ 375KB decoded, comfortably more than an avatar needs).
  avatarUrl: z.string().trim().url().max(500_000).optional().or(z.literal("")),
  themeColor: themeColorSchema.optional(),
  theme: profileThemeSchema.optional(),
  socials: socialsSchema.optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const checkUsernameSchema = z.object({
  u: usernameSchema,
});
