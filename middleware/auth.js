// /middleware/auth.js
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ ok: false, msg: "No token" });

  try {
    // decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded itself already contains { id, name, email }
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ ok: false, msg: "Invalid token" });
  }
}
