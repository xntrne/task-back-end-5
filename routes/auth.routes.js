import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createDB } from "../db.js";
import { validateBody } from "../middleware/validateBody.js";
import { registerSchema } from "../schema/auth/register.schema.js";
import { loginSchema } from "../schema/auth/login.schema.js";

export const authRouter = Router();

const db = createDB();
const SALT_ROUNDS = 10;
const COOKIE_NAME = "node_api_token";
const COOKIE_MAX_AGE_MS = 60 * 60 * 1000;

// POST /auth/register
authRouter.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await db.getOne("auth_users", { email });
    if (existingUser) {
      res.status(422).json({ errors: { email: { errors: ["email already in use"] } } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await db.create("auth_users", { username, email, passwordHash, role });

    res.status(201).json({ message: "register successful, you can now login" });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
authRouter.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await db.getOne("auth_users", { email });
    if (!user) {
      res.status(422).json({ error: "email or password are invalid" });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      res.status(422).json({ error: "email or password are invalid" });
      return;
    }

    const payload = { id: user.id, email: user.email, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_MS,
    });

    res.json({ message: "login successful", data: { user: payload } });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
authRouter.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "logout successful" });
});
