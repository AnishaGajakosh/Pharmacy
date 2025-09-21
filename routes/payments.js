import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import authMiddleware from "../middleware/auth.js";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ ok: false, msg: "Invalid amount" });
    }

    const paise = Math.round(amount * 100);
    const order = await razorpay.orders.create({
      amount: paise,
      currency: "INR",
      payment_capture: 1,
    });

    const payment = new Payment({
      user: req.user.id,
      razorpayOrderId: order.id,
      amount: paise,
      currency: "INR",
      status: "created",
      raw: { order },
    });
    await payment.save();

    res.json({ ok: true, order, key: process.env.RAZORPAY_KEY_ID, paymentId: payment._id });
  } catch (err) {
    console.error("Razorpay error:", err);
    res.status(500).json({ ok: false, msg: "Payment init failed" });
  }
});

router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      shipping,
      amount,
      paymentId,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, msg: "Missing Razorpay verification fields" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      if (paymentId) {
        await Payment.findByIdAndUpdate(paymentId, {
          status: "failed",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          raw: { verified: false },
        });
      }
      return res.status(400).json({ ok: false, msg: "Invalid signature" });
    }

    let payment;
    if (paymentId) {
      payment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          raw: { verified: true, razorpay_payment_id, razorpay_order_id },
        },
        { new: true }
      );
    } else {
      payment = new Payment({
        user: req.user.id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: Math.round((amount || 0) * 100),
        currency: "INR",
        status: "paid",
        raw: { verified: true },
      });
      await payment.save();
    }

    const order = new Order({
      user: req.user.id,
      items,
      shipping,
      paymentMethod: "paid",
      payment: payment._id,
      status: "pending",
    });
    await order.save();

    return res.status(201).json({ ok: true, orderId: order._id });
  } catch (err) {
    console.error("Payment verify/create order error:", err);
    return res.status(500).json({ ok: false, msg: "Server error verifying payment" });
  }
});

export default router;
