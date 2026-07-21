const express = require("express");
const {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);
router.route("/").get(getSuppliers).post(createSupplier);
router.route("/:id").put(updateSupplier).delete(deleteSupplier);

module.exports = router;
