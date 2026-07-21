const express = require("express");
const {
  createDealer,
  getDealers,
  updateDealer,
  deleteDealer,
} = require("../controllers/dealerController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").get(getDealers).post(createDealer);
router.route("/:id").put(updateDealer).delete(deleteDealer);

module.exports = router;
