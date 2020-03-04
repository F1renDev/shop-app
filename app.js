const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const User = require("./models/user");

const MONGODB_URI = `mongodb+srv://F1ren:qwe123@cluster0-lhqoo.mongodb.net/shop?retryWrites=true&w=majority`;

//Setting the url and specifing the collection name for the sessions that will be
//stored in mongoDB
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions"
});

app.use(bodyParser.urlencoded({ extended: true }));

//Setting the templating engine to be 'ejs' and specifing the view folders for it
app.set("view engine", "ejs");
app.set("views", "views");

//This enables the access to different kind of files statically (css, images, etc.)
//from given folder
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/error");

//Defining how the sessions should be crated and updated and where to store them
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

//Do nothing if there is no active user session
//or store the user in the request otherwise
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

//Connecting to the mongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    app.listen(5000);
  })
  .catch(err => console.log(err));
