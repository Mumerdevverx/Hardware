const { body } = require("express-validator");

const dealerValidation = [
  body("name").trim().notEmpty().withMessage("Dealer name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
];

module.exports = { dealerValidation };
