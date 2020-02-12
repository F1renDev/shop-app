const express = require("express");

const router = express.Router();

const productsController = require("../controllers/products");

//Handling the get request to "/"
router.get("/", productsController.getProducts);

module.exports = router;
