const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");

const createSale = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next({ message: "Validation failed", errors: errors.array() });
  }

  const {
    invoiceNumber,
    customerName,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    discount = 0,
    tax = 0,
    grandTotal,
    paymentMethod,
  } = req.body;

  try {
    const sale = await Sale.create({
      invoiceNumber,
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      discount,
      tax,
      grandTotal,
      paymentMethod,
      status: paymentMethod === "credit" ? "credit" : "paid",
      createdBy: req.user._id,
    });

    await Promise.all(
      items.map(async (item) => {
        if (item.productId) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.quantity = Math.max(0, product.quantity - item.quantity);
            await product.save();
          }
        }
      }),
    );

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

const getSales = async (req, res, next) => {
  try {
    const { search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Sale.countDocuments(query);
    res.json({ success: true, data: sales, total });
  } catch (error) {
    next(error);
  }
};

const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      res.status(404);
      return next({ message: "Sale not found" });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      res.status(404);
      return next({ message: "Sale not found" });
    }
    res.json({ success: true, message: "Sale deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSale, getSales, getSale, deleteSale };
