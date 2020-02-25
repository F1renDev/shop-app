const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const sequelize = require("./utility/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

app.set("view engine", "ejs");
app.set("views", "views");

//This enables the access to different kind of files statically (css, images, etc.)
// from given folder
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      //Storing user in the request
      //This is a sequelize object with all the methods provided by sequelize
      //not just a simple object
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

//Establishing relations between models-----------

//If a user is deleted the product is also gone
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

//Looking at all models created by sequelize and creating tables for them
sequelize
  // .sync({force:true})
  .sync()
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: "Test", email: "test@test.com" });
    }
    return user;
  })
  .then(user => {
    return user.createCart();
  })
  .then(cart => {
    //Starting the server
    app.listen(5000);
  })
  .catch(err => console.log(err));
