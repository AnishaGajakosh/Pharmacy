import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;

    const order = new Order({
      user: req.user.id,   // logged-in user ID from token
      items,
      paymentMethod,
      status: "pending"
    });

    await order.save();
    res.json({ ok: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

// Get all orders for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ ok: true, orders });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

export default router;
