const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

//This enables the access to different kind of files statically (css, images, etc.)
// from given folder
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
const mongoConnect = require("./utility/database").mongoConnect;
const User = require('./models/user')

app.use((req, res, next) => {
    User.findById("5e567fa81c9d4400009c6c23")
      .then(user => {
        //Storing user in the request
        //This is a sequelize object with all the methods provided by sequelize
        //not just a simple object
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  next();
});

//The handled requests that allow access to certain pages
app.use("/admin", adminRoutes);
app.use(shopRoutes);

//If none of the above matched the request - the 404 page is shown
app.use(errorController.get404);

mongoConnect(() => {
  if()
  app.listen(5000);
});
