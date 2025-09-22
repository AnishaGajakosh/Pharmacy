import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    let { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ ok: false, msg: "Missing fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ ok: false, msg: "Passwords do not match" });
    }

    email = email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ ok: false, msg: "Email already registered" });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, msg: "Password must be at least 6 characters long" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const payload = { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ ok: true, token, user: payload });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, msg: "Missing fields" });
    }

    email = email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ ok: false, msg: "Not Registered. Please register first." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ ok: false, msg: "Invalid credentials" });
    }

    const payload = { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ ok: true, token, user: payload });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

export default router;
