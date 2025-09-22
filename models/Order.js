import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        id: { type: String, required: true }, // product id (med001 etc.)
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
      }
    ],
    shipping: {
      name: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      phone: String
    },
    paymentMethod: { type: String, required: true },
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
