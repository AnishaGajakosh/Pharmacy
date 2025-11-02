import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Get all orders (Admin only)
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // Only populate user info
      .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Admin fetch orders error:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
});

// ✅ Update order status (Admin)
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ message: "Server error while updating order" });
  }
});

export default router;
