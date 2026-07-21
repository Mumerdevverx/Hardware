const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendEmail } = require("../services/emailService");

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      return next({ message: "User already exists" });
    }

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      res.status(403);
      return next({
        message: "Registration disabled. Admin account already created.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      return next({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      return next({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      return next({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 60;
    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;
    const emailBody = `Reset your password by visiting: ${resetUrl}\nIf you did not request this, ignore this email.`;

    await sendEmail({
      to: user.email,
      subject: "POS System Password Reset",
      text: emailBody,
      html: `<p>Reset your password by clicking the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`,
    });

    res.json({
      success: true,
      message: "Password reset instructions sent if the email is registered",
      resetToken: process.env.EMAIL_HOST ? undefined : resetToken,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      res.status(400);
      return next({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
