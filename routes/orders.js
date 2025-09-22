import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ Create Order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, error: "No items in order" });
    }

    const orderItems = [];
    for (const item of items) {
      // ✅ lookup product by MongoDB _id
      const product = await Product.findById(item.id);

      if (!product) {
        return res.status(400).json({ ok: false, error: `Product not found: ${item.id}` });
      }

      orderItems.push({
        id: product._id.toString(), // save _id as string
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shipping,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
    });

    await order.save();
    res.json({ ok: true, order });
  } catch (err) {
    console.error("❌ Error placing order:", err.message);
    res.status(500).json({ ok: false, error: "Error placing order" });
  }
});

// ✅ Get User Orders
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
