import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get orders
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

// Place order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, msg: "No items in order" });
    }

    const detailedItems = await Promise.all(
      items.map(async (it) => {
        let product = null;

        // ✅ If it.id looks like a Mongo ObjectId → findById
        if (it.id && it.id.match(/^[0-9a-fA-F]{24}$/)) {
          product = await Product.findById(it.id);
        }

        // ✅ Else treat it.id as custom product code (like P001)
        if (!product) {
          product = await Product.findOne({ id: it.id });
        }

        if (!product) throw new Error(`Product not found: ${it.id}`);

        return {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: it.quantity,
        };
      })
    );

    const order = new Order({
      user: req.user.id,
      items: detailedItems,
      shipping,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
    });

    await order.save();
    res.status(201).json({ ok: true, orderId: order._id, order });
  } catch (err) {
    console.error("❌ Order create error:", err.message);
    res.status(500).json({ ok: false, msg: "Error placing order" });
  }
});

export default router;
