const { body } = require("express-validator");

const expenseValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than zero"),
  body("date").isISO8601().withMessage("Valid date is required"),
];

module.exports = { expenseValidation };
