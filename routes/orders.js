import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// 🟢 Get all orders for logged-in user
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

// 🟢 Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, msg: "No items in order" });
    }

    // Map items with DB products
    const detailedItems = await Promise.all(
      items.map(async (it) => {
        // 🔑 Use product.code instead of _id
        const product = await Product.findOne({ code: it.id });
        if (!product) throw new Error(`Product not found: ${it.id}`);

        return {
          id: product._id.toString(),
          code: product.code,
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
    console.error("❌ Order create error:", err);
    res.status(500).json({ ok: false, msg: "Error placing order" });
  }
});

export default router;
