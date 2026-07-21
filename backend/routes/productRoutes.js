const express = require("express");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { productCreateValidation } = require("../validations/productValidation");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);
router
  .route("/")
  .get(getProducts)
  .post(upload.single("image"), productCreateValidation, createProduct);
router
  .route("/:id")
  .get(getProduct)
  .put(upload.single("image"), productCreateValidation, updateProduct)
  .delete(deleteProduct);

module.exports = router;
