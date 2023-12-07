const express = require("express");
const router = express.Router();

const {findUser,addToCart} = require("./../controllers/users_controller");

router.post("/cart", addToCart);
router.get("/find-user", findUser);

module.exports = router;
