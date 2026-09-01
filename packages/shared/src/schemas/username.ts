import { z } from "zod";
import { isReservedUsername } from "../reserved-usernames";

// Single source of truth for username shape. Normalizes to lowercase so
// `/Kiki` and `/kiki` can never resolve to two different profiles.
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username minimal 3 karakter")
  .max(30, "Username maksimal 30 karakter")
  .regex(
    /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/,
    "Hanya huruf kecil, angka, - dan _, tidak boleh diawali/diakhiri tanda hubung"
  )
  .refine((value) => !isReservedUsername(value), {
    message: "Username ini tidak tersedia",
  });
