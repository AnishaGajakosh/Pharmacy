import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        id: { type: String, required: true }, // e.g. "med001"
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
      }
    ],
    shipping: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      phone: { type: String, required: true }
    },
    paymentMethod: { type: String, default: "cod" },
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
