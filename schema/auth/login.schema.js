import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("invalid email address"),
  password: z.string().min(8, "password must be at least 8 characters"),
});
