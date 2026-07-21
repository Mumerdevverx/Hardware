const express = require("express");
const {
  createSale,
  getSales,
  getSale,
  deleteSale,
} = require("../controllers/saleController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").get(getSales).post(createSale);
router.route("/:id").get(getSale).delete(deleteSale);

module.exports = router;
