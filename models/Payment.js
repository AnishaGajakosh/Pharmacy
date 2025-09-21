// /models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  amount: { type: Number }, // in paise or actual? we'll store amount in paise to be precise
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
  raw: { type: Object }, // store raw response from webhook/handler
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
