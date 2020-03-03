const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const MONGODB_URI = `mongodb+srv://F1ren:qwe123@cluster0-lhqoo.mongodb.net/shop?retryWrites=true&w=majority`;

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions"
});

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

//This enables the access to different kind of files statically (css, images, etc.)
// from given folder
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/error");
const User = require("./models/user");

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

//The handled requests that allow access to certain pages
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//If none of the above matched the request - the 404 page is shown
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
        console.log(user);
        user.save();
      }
    });
    app.listen(5000);
  })
  .catch(err => console.log(err));
