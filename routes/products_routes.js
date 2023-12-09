const express = require("express");
const router = express.Router();

const {allProducts} = require("./../controllers/products_controllers");

router.get("/get-products", allProducts);

module.exports = router;
