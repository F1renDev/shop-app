const express = require("express");

const router = express.Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

//Handling the GET request to "/admin/add-product"
router.get("/add-product", isAuth, adminController.getAddProduct);

//Handling the POST request to "/admin/add-product"
router.post("/add-product", isAuth, adminController.postAddProduct);

router.get("/products", isAuth, adminController.getProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product/", isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
