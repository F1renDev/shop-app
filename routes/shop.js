const express = require("express");
const path = require("path");

const rootDir = require("../utility/path");

const router = express.Router();

//Handling the get request to "/"
router.get("/", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "shop.html"));
});

module.exports = router;
