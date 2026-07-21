const { body } = require("express-validator");

const saleValidation = [
  body("invoiceNumber")
    .trim()
    .notEmpty()
    .withMessage("Invoice number is required"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one sale item is required"),
  body("subtotal")
    .isFloat({ min: 0 })
    .withMessage("Subtotal must be a valid amount"),
  body("grandTotal")
    .isFloat({ min: 0 })
    .withMessage("Grand total must be a valid amount"),
  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("Payment method is required"),
];

module.exports = { saleValidation };
