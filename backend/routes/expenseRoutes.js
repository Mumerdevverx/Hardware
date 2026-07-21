const express = require("express");
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const { expenseValidation } = require("../validations/expenseValidation");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").get(getExpenses).post(expenseValidation, createExpense);
router
  .route("/:id")
  .put(expenseValidation, updateExpense)
  .delete(deleteExpense);

module.exports = router;
