const { body } = require("express-validator");

const productCreateValidation = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("purchasePrice")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a valid number"),
  body("sellingPrice")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a valid number"),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be zero or more"),
];

module.exports = { productCreateValidation };
