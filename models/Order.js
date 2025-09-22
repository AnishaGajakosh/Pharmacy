import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        id: { type: String, required: true },      // e.g., med002
        name: { type: String, required: true },    // e.g., Cough Syrup (100 ml)
        price: { type: Number, required: true },   // e.g., 120
        quantity: { type: Number, required: true } // e.g., 4
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
    paymentMethod: { type: String, default: "cod" }, // cod / card / upi
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
