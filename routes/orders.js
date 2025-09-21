// /routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, msg: "No items in order" });
    }

    const order = new Order({
      user: req.user.id,
      items,
      shipping,
      paymentMethod,
    });

    await order.save();
    return res.status(201).json({ ok: true, orderId: order._id });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ ok: false, msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("payment")
      .sort({ createdAt: -1 });
    res.json({ ok: true, orders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

export default router;
