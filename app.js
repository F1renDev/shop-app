const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./utility/database");


app.set("view engine", "ejs");
app.set("views", "views");

//This enables the access to different kind of files statically (css, images, etc.)
// from given folder
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");

//The handled requests that allow access to certain pages
app.use("/admin", adminRoutes);
app.use(shopRoutes);

//If none of the above matched the request - the 404 page is shown
app.use(errorController.get404);

//Starting the server
app.listen(5000);
