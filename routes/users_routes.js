const express = require("express");
const router = express.Router();

const {findUser,addToCart, checkout, getUserDetailsForAdmin, generateOneDiscountCode} = require("./../controllers/users_controller");

router.post("/cart", addToCart);
router.get("/find-user", findUser);
router.post("/checkout", checkout);
router.post("/generate-discount-code", generateOneDiscountCode);
router.post("/admin-user-details", getUserDetailsForAdmin)

module.exports = router;
