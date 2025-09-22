// backend/routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, msg: "No items in order" });
    }

    // 🔑 Fix: Find product by custom "id" field (not _id)
    const detailedItems = await Promise.all(
      items.map(async (it) => {
        const product = await Product.findOne({ id: it.id }); // FIXED

        if (!product) throw new Error(`Product not found: ${it.id}`);

        return {
          id: product.id, // use custom product id
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

// ✅ Get user orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ ok: true, orders });
  } catch (err) {
    console.error("❌ Fetch orders error:", err.message);
    res.status(500).json({ ok: false, msg: "Error fetching orders" });
  }
});

export default router;
