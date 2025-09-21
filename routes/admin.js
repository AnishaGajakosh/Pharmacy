import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js"; // your JWT middleware

const router = express.Router();

// ✅ Get all orders (admin only)
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    // check if logged in user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ ok: false, msg: "Access denied" });
    }

    const orders = await Order.find()
      .populate("user", "name email") // show user details
      .populate("payment");

    res.json({ ok: true, orders });
  } catch (err) {
    console.error("❌ Admin fetch orders error:", err);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

export default router;
