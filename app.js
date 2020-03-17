const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const User = require("./models/user");
const MONGODB_URI = `mongodb+srv://F1ren:qwe123@cluster0-lhqoo.mongodb.net/shop?retryWrites=true&w=majority`;

//Configuration for multer to describe how the uploaded files should be stored
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    //The first argument is either an error to display it or implicit null
    //to say that everything is ok and the file should be stored
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    callback(null, new Date().getTime() + "-" + file.originalname);
  }
});

//Filtering for different mimetypes (png, jpeg, jpg - ok)
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
//input filed name is 'image', so looking for a file with name image
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

//Setting the url and specifing the collection name for the sessions that will be
//stored in mongoDB
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions"
});

//Setting the templating engine to be 'ejs' and specifing the view folders for it
app.set("view engine", "ejs");
app.set("views", "views");

//This enables the access to different kind of files statically (css, images, etc.)
//from given folder
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));

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

//Protecting from the csrf attacks
const csrfProtection = csrf();
app.use(csrfProtection);

//the request object will have the flash method => req.flash()
app.use(flash());

//Adding these data to every page that is rendered
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

//Do nothing if there is no active user session
//or store the user in the request otherwise
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      //This error will be thrown if there is some technical issue with the database
      next(new Error(err));
    });
});

//The handled requests that allow access to certain pages
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

//If none of the above matched the request - the 404 page is shown
app.use(errorController.get404);

//Error handling middleware that uses exactly 4 arguments
app.use((error, req, res, next) => {
  // res.redirect("/500");
  res.status(500).render("500", {
    pageTitle: "An Error Occured",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn
  });
});

//Connecting to the mongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    app.listen(5000);
  })
  .catch(err => console.log(err));
