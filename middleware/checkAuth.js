import jwt from "jsonwebtoken";

// checkAuth
export function checkAuth(req, res, next) {
  const token = req.cookies.node_api_token;

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
}
