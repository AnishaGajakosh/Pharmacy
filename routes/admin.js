// routes/admin.js
import express from "express";
import Order from "../models/Order.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ✅ Fetch all orders (admin only)
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ ok: false, msg: "Access denied" });
    }

    const orders = await Order.find()
      .populate("user", "name email")  // customer details
      .populate("payment");            // payment details

    res.json({ ok: true, orders });
  } catch (err) {
    console.error("❌ Admin fetch orders error:", err);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

export default router;
