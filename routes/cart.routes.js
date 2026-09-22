import { Router } from "express";
import { createDB } from "../db.js";
import { validateBody } from "../middleware/validateBody.js";
import { cartItemSchema, cartQuantitySchema } from "../schema/cart.schema.js";

export const cartRouter = Router();

const db = createDB();

// GET /api/cart
cartRouter.get("/", async (req, res, next) => {
  try {
    const cart = await db.getOne("carts", { userId: req.user.id });

    if (!cart) {
      res.json({ data: { id: null, userId: req.user.id, products: [] } });
      return;
    }

    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart
cartRouter.post("/", validateBody(cartItemSchema), async (req, res, next) => {
  try {
    const item = req.body;
    const cart = await db.getOne("carts", { userId: req.user.id });

    if (!cart) {
      const newCart = await db.create("carts", {
        userId: req.user.id,
        products: [item],
      });
      res.status(201).json({ message: "product added to cart", data: newCart });
      return;
    }

    const existingItem = cart.products.find((p) => p.id === item.id);
    let updatedProducts;

    if (existingItem) {
      updatedProducts = cart.products.map((p) =>
        p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p
      );
    } else {
      updatedProducts = [...cart.products, item];
    }

    await db.update("carts", cart.id, { products: updatedProducts });
    const updatedCart = await db.getById("carts", cart.id);

    res.status(201).json({ message: "product added to cart", data: updatedCart });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cart/:productId
cartRouter.patch("/:productId", validateBody(cartQuantitySchema), async (req, res, next) => {
  try {
    const cart = await db.getOne("carts", { userId: req.user.id });

    if (!cart || !cart.products.some((p) => p.id === req.params.productId)) {
      res.status(404).json({ error: "product not found in cart" });
      return;
    }

    const updatedProducts = cart.products.map((p) =>
      p.id === req.params.productId ? { ...p, quantity: req.body.quantity } : p
    );

    await db.update("carts", cart.id, { products: updatedProducts });
    const updatedCart = await db.getById("carts", cart.id);

    res.json({ message: "cart updated", data: updatedCart });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart/:productId
cartRouter.delete("/:productId", async (req, res, next) => {
  try {
    const cart = await db.getOne("carts", { userId: req.user.id });

    if (!cart || !cart.products.some((p) => p.id === req.params.productId)) {
      res.status(404).json({ error: "product not found in cart" });
      return;
    }

    const updatedProducts = cart.products.filter((p) => p.id !== req.params.productId);
    await db.update("carts", cart.id, { products: updatedProducts });

    res.json({ message: "product removed from cart" });
  } catch (error) {
    next(error);
  }
});
