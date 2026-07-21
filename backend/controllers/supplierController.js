const { validationResult } = require("express-validator");
const Supplier = require("../models/Supplier");

const createSupplier = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const getSuppliers = async (req, res, next) => {
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
    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) {
      res.status(404);
      return next({ message: "Supplier not found" });
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      res.status(404);
      return next({ message: "Supplier not found" });
    }
    res.json({ success: true, message: "Supplier removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
};
