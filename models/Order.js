// /models/Order.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [itemSchema], required: true },
  shipping: {
    name: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    phone: String
  },
  paymentMethod: String, // cod, paid
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }, // link to payment if any
  status: { type: String, default: "pending" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
