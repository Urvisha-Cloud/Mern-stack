const express = require("express");
const jwt = require("jsonwebtoken");
const user = require("../model/model.user"); 
const bcrypt = require("bcrypt");
require('dotenv').config();

const userRoutes = express.Router();


// ========================= REGISTER =========================
userRoutes.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPass, numbers } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPass || !numbers || numbers.length === 0) {
      return res.status(400).json({ msg: "All fields are required!" });
    }

    if (password !== confirmPass) {
      return res.status(400).json({ msg: "Passwords do not match." });
    }
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already registered with this email." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      numbers
    });

    await newUser.save();
    return res.status(200).json({ msg: "User registered successfully!", user: newUser });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ========================= LOGIN =========================
userRoutes.post("/login", async (req, res) => {
  try {
    const { loginEmail, loginPassword } = req.body;

    if (!loginEmail || !loginPassword) {
      return res.status(400).json({
        email: !loginEmail ? "Email is required" : null,
        password: !loginPassword ? "Password is required" : null,
        message: "Email and Password are required."
      });
    }

    const checkUser = await user.findOne({ email: loginEmail });
    if (!checkUser) {
      return res.status(400).json({ email: "User not found." });
    }

    const isMatch = await bcrypt.compare(loginPassword, checkUser.password);
    if (!isMatch) {
      return res.status(400).json({ password: "Invalid password." });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: checkUser._id, email: checkUser.email },
      process.env.TOKEN_KEY,
      { expiresIn: "7d" }
    );

    const { firstName, lastName, email, numbers,_id } = checkUser;

    return res.status(200).json({
      msg: "Login successful!",
      token,
      user: checkUser
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// ========================= LOGOUT =========================
userRoutes.get("/logout", (req, res) => {
  return res.status(200).json({ msg: "Logout successful!" });
});

module.exports = userRoutes;
