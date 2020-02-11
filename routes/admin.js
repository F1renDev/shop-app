const express = require("express");
const path = require("path");

const rootDir = require("../utility/path");

const router = express.Router();

//Handling the GET request to "/admin/add-product"
router.get("/add-product", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "add-product.html"));
});

//Handling the POST request to "/admin/add-product"
router.post("/add-product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

module.exports = router;
