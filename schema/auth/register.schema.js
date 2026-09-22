import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().trim().min(2, "username must be at least 2 characters"),
    email: z.string().trim().email("invalid email address"),
    password: z
      .string()
      .min(8, "password must be at least 8 characters")
      .regex(/[a-z]/, "password must contain a lowercase letter")
      .regex(/[A-Z]/, "password must contain an uppercase letter")
      .regex(/[0-9]/, "password must contain a digit")
      .regex(/[^a-zA-Z0-9]/, "password must contain a special character"),
    password_confirmation: z.string(),
    role: z.enum(["customer", "merchant"]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "passwords do not match",
    path: ["password_confirmation"],
  });
