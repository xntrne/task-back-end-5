import { Router } from "express";
import { createDB } from "../db.js";

export const debugRouter = Router();

const db = createDB();

// GET /api/debug
debugRouter.get("/", async (req, res, next) => {
  try {
    const data = await db.raw();
    res.json(data);
  } catch (error) {
    next(error);
  }
});
