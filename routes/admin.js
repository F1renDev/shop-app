const express = require("express");
const path = require("path");

const router = express.Router();
const productsController = require("../controllers/products");

//Handling the GET request to "/admin/add-product"
router.get("/add-product", productsController.getAddProduct);

//Handling the POST request to "/admin/add-product"
router.post("/add-product", productsController.postAddProduct);

module.exports = router;
