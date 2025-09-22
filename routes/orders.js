import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Create Order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, error: "No items in order" });
    }

    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.id); // ✅ using MongoDB _id

      orderItems.push({
        id: item.id,
        name: product ? product.name : "Unknown Product",
        price: product ? product.price : 0,
        quantity: item.quantity
      });
    }

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shipping,
      paymentMethod: paymentMethod || "cod",
      status: "pending"
    });

    await order.save();
    res.json({ ok: true, order });
  } catch (err) {
    console.error("❌ Error placing order:", err.message);
    res.status(500).json({ ok: false, error: "Error placing order" });
  }
});

// Get User Orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ ok: true, orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
