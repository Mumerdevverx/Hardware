const { validationResult } = require("express-validator");
const Dealer = require("../models/Dealer");

const createDealer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const dealer = await Dealer.create(req.body);
    res.status(201).json({ success: true, data: dealer });
  } catch (error) {
    next(error);
  }
};

const getDealers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const dealers = await Dealer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: dealers });
  } catch (error) {
    next(error);
  }
};

const updateDealer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const dealer = await Dealer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dealer) {
      res.status(404);
      return next({ message: "Dealer not found" });
    }
    res.json({ success: true, data: dealer });
  } catch (error) {
    next(error);
  }
};

const deleteDealer = async (req, res, next) => {
  try {
    const dealer = await Dealer.findByIdAndDelete(req.params.id);
    if (!dealer) {
      res.status(404);
      return next({ message: "Dealer not found" });
    }
    res.json({ success: true, message: "Dealer removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDealer, getDealers, updateDealer, deleteDealer };
