const express = require("express");
const path = require("path");

const router = express.Router();
const adminController = require("../controllers/admin");

//Handling the GET request to "/admin/add-product"
router.get("/add-product", adminController.getAddProduct);

//Handling the POST request to "/admin/add-product"
router.post("/add-product", adminController.postAddProduct);

router.get("/products", adminController.getProducts);

module.exports = router;
