// routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// POST /api/orders → Place new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, msg: "No items in order" });
    }

    const orderItems = [];
    for (const it of items) {
      const product = await Product.findOne({ id: it.id }); // match med001
      if (!product) {
        return res.status(404).json({ ok: false, msg: `Product not found: ${it.id}` });
      }

      orderItems.push({
        product: product._id, // reference
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: it.quantity,
      });
    }

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shipping,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
      totalPrice: orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
    });

    await order.save();

    res.status(201).json({ ok: true, orderId: order._id, order });
  } catch (err) {
    console.error("❌ Order create error:", err);
    res.status(500).json({ ok: false, msg: "Error placing order" });
  }
});

export default router;
