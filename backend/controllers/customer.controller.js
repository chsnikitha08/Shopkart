import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import generateToken, { cookieOptions, clearCookieOptions } from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

const isBlank = (v) => typeof v !== "string" || v.trim() === "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicCustomer = (c) => ({
  _id: c._id,
  fullName: c.fullName,
  email: c.email,
  phone: c.phone,
});

// POST /customers/register
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body || {};

  if ([fullName, email, password, phone].some(isBlank)) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ success: false, message: "Email is not valid" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ success: false, message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await Customer.exists({ email: normalizedEmail })) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const customer = await Customer.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: hashed,
    phone: phone.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Customer registered successfully",
    customer: publicCustomer(customer),
  });
});

// POST /customers/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const invalid = () =>
    res.status(401).json({ success: false, message: "Invalid credentials" });

  if (isBlank(email) || isBlank(password)) return invalid();

  const customer = await Customer.findOne({ email: email.trim().toLowerCase() }).select(
    "+password"
  );
  if (!customer || !(await bcrypt.compare(password, customer.password))) return invalid();

  const token = generateToken(customer._id);
  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    customer: publicCustomer(customer),
  });
});

// GET /customers/me   (protected)
export const getMe = (req, res) => {
  res.status(200).json(publicCustomer(req.user));
};

// POST /customers/logout   (protected)
export const logout = (req, res) => {
  res.clearCookie("token", clearCookieOptions);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// PATCH /customers/change-password   (protected, bonus)
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};

  if (isBlank(oldPassword) || isBlank(newPassword)) {
    return res
      .status(400)
      .json({ success: false, message: "Old and new password are required" });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ success: false, message: "New password must be at least 6 characters" });
  }

  const customer = await Customer.findById(req.user._id).select("+password");
  if (!(await bcrypt.compare(oldPassword, customer.password))) {
    return res.status(401).json({ success: false, message: "Old password is incorrect" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await Customer.updateOne({ _id: customer._id }, { $set: { password: hashed } });

  res.status(200).json({ success: true, message: "Password changed successfully" });
});
