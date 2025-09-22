import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    sku: String,
    image: String,
    category: String,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
