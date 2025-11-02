import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ ok: false, error: "Access denied" });
  }
  next();
}

router.get("/orders", authMiddleware, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ ok: true, orders });
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

router.put("/orders/:id/status", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ ok: false, error: "Order not found" });
    }

    res.json({ ok: true, order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
