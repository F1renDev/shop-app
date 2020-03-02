const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

//This enables the access to different kind of files statically (css, images, etc.)
// from given folder
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
const User = require("./models/user");

app.use((req, res, next) => {
  User.findById("5e5a6acd769a8c2f1c40c8c5")
    .then(user => {
      //Storing user in the request
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

//The handled requests that allow access to certain pages
app.use("/admin", adminRoutes);
app.use(shopRoutes);

//If none of the above matched the request - the 404 page is shown
app.use(errorController.get404);

mongoose
  .connect(
    `mongodb+srv://F1ren:qwe123@cluster0-lhqoo.mongodb.net/shop?retryWrites=true&w=majority`
  )
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: "Test",
          email: "test@test.com",
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(5000);
  })
  .catch(err => console.log(err));
