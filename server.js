import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import Product from "./models/Product.js"; // ⬅ Product model

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// =============================
// 📌 MongoDB Connection + Load Products
// =============================
async function loadProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const rawData = fs.readFileSync("./products.json");
      const products = JSON.parse(rawData);
      await Product.insertMany(products);
      console.log("✅ Products imported into MongoDB");
    } else {
      console.log("ℹ️ Products already exist in MongoDB, skipping import");
    }
  } catch (err) {
    console.error("❌ Error loading products:", err.message);
  }
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await loadProducts(); // auto-import products.json
  })
  .catch((err) => {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });

// =============================
// 📌 Contact Schema & Routes
// =============================
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model("Contact", contactSchema);

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ ok: false, error: "All fields are required" });
    }
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.json({ ok: true, message: "Message saved successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/contact/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const messages = await Contact.find({ email }).sort({ createdAt: -1 });
    res.json({ ok: true, messages });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =============================
// 📌 API Routes
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// =============================
// 📌 Static File Serving
// =============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

// Serve frontend index.html for all non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =============================
// 📌 Start Server
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
