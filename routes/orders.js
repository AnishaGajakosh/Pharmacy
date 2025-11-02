import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, error: "No items in order" });
    }

    const order = new Order({
      user: req.user.id,
      items: items.map(it => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity
      })),
      shipping,
      paymentMethod: paymentMethod || "cod",
      status: "pending"
    });

    await order.save();
    res.json({ ok: true, order });
  } catch (err) {
    console.error(" Error placing order:", err.message);
    res.status(500).json({ ok: false, error: "Error placing order" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ ok: true, orders });
  } catch (err) {
    console.error(" Error fetching orders:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
