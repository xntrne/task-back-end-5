import { Router } from "express";
import { createDB } from "../db.js";
import { checkAuth } from "../middleware/checkAuth.js";
import { checkRole } from "../middleware/checkRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { productCreateSchema, productUpdateSchema } from "../schema/product.schema.js";

export const productsRouter = Router();

const db = createDB();

// GET /api/products
productsRouter.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    const products = await db.getAll("products");

    if (!search) {
      res.json({ data: products });
      return;
    }

    const lowerCaseSearch = String(search).toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerCaseSearch) ||
        p.description.toLowerCase().includes(lowerCaseSearch)
    );

    res.json({ data: filtered });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await db.getById("products", req.params.id);

    if (!product) {
      res.status(404).json({ error: "product not found" });
      return;
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products
productsRouter.post(
  "/",
  checkAuth,
  checkRole("merchant"),
  validateBody(productCreateSchema),
  async (req, res, next) => {
    try {
      const product = await db.create("products", req.body);
      res.status(201).json({ message: "product created successfully", data: product });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/products/:id
productsRouter.patch(
  "/:id",
  checkAuth,
  checkRole("merchant"),
  validateBody(productUpdateSchema),
  async (req, res, next) => {
    try {
      const existingProduct = await db.getById("products", req.params.id);

      if (!existingProduct) {
        res.status(404).json({ error: "product not found" });
        return;
      }

      await db.update("products", req.params.id, req.body);
      const updatedProduct = await db.getById("products", req.params.id);

      res.json({ message: "product updated successfully", data: updatedProduct });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/products/:id
productsRouter.delete("/:id", checkAuth, checkRole("merchant"), async (req, res, next) => {
  try {
    const existingProduct = await db.getById("products", req.params.id);

    if (!existingProduct) {
      res.status(404).json({ error: "product not found" });
      return;
    }

    await db.delete("products", req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
