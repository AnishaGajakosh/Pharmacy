import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

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
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, msg: "No items in order" });
    }

    const order = new Order({
      user: req.user.id,
      items,
      shipping,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
    });

    await order.save();
   res.status(201).json({ ok: true, orderId: order._id, order });
  } catch (err) {
    console.error("❌ Order create error:", err);
    res.status(500).json({ ok: false, msg: "Error placing order" });
  }
});

export default router;
