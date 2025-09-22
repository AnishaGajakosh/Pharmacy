// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      id: String,       // like med001
      name: String,     // product snapshot
      price: Number,    // snapshot
      quantity: Number,
    }
  ],
  shipping: {
    name: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
  },
  paymentMethod: { type: String, default: "cod" },
  status: { type: String, default: "pending" },
  totalPrice: Number,
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
