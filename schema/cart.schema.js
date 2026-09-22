import { z } from "zod";

export const cartItemSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().min(1, "description is required"),
  price: z.number().positive("price must be a positive number"),
  image: z.string().trim().optional().default(""),
  quantity: z.number().int().positive("quantity must be a positive integer"),
});

export const cartQuantitySchema = z.object({
  quantity: z.number().int().positive("quantity must be a positive integer"),
});
