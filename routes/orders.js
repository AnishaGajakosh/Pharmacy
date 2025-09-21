import express from "express";
import Order from "../models/Order.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Fetch user orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("user", "name email")
      .populate("payment")
      .sort({ createdAt: -1 });

    res.json({ ok: true, orders });
  } catch (err) {
    console.error("❌ Orders fetch error:", err);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

export default router;
