const { body } = require("express-validator");

const supplierValidation = [
  body("name").trim().notEmpty().withMessage("Supplier name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
];

module.exports = { supplierValidation };
