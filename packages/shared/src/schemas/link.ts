import { z } from "zod";

export const createLinkSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(100),
  url: z.string().trim().url("URL tidak valid").max(2048),
  icon: z.string().trim().max(50).optional(),
  isFeatured: z.boolean().optional().default(false),
});
export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const updateLinkSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  url: z.string().trim().url().max(2048).optional(),
  icon: z.string().trim().max(50).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export const reorderLinksSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});
export type ReorderLinksInput = z.infer<typeof reorderLinksSchema>;
