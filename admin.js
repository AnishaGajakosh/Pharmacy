// routes/admin.js
import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all orders (Admin only)
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ ok: true, orders });
  } catch (err) {
    console.error("Error loading admin orders:", err.message);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ Update order status
router.put("/orders/:id/status", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!order) return res.status(404).json({ ok: false, error: "Order not found" });

    res.json({ ok: true, order });
  } catch (err) {
    console.error("Error updating order status:", err.message);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
