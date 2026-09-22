import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().min(1, "description is required"),
  price: z.number().positive("price must be a positive number"),
  image: z.string().trim().optional().default(""),
});

export const productUpdateSchema = productCreateSchema.partial();
