import { Router } from "express";
import { createDB } from "../db.js";

export const ordersRouter = Router();

const db = createDB();

// GET /api/orders
ordersRouter.get("/", async (req, res, next) => {
  try {
    const allOrders = await db.getAll("orders");
    const userOrders = allOrders.filter((order) => order.userId === req.user.id);

    res.json({ data: userOrders });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/checkout
ordersRouter.post("/checkout", async (req, res, next) => {
  try {
    const cart = await db.getOne("carts", { userId: req.user.id });

    if (!cart || cart.products.length === 0) {
      res.status(422).json({ error: "cart is empty" });
      return;
    }

    const total = cart.products.reduce((sum, p) => sum + p.price * p.quantity, 0);

    const order = await db.create("orders", {
      userId: req.user.id,
      products: cart.products,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    await db.deleteWhere("carts", { userId: req.user.id });

    res.status(201).json({ message: "order placed successfully", data: order });
  } catch (error) {
    next(error);
  }
});
