const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
 //Getting the page number from query params
 const page = +req.query.page || 1;
 let totalItems;

 Product.find()
   .countDocuments()
   .then(numberOfProducts => {
     totalItems = numberOfProducts;
     return (
       Product.find()
         //Skipping the items that should be on previous page
         //and limiting the quantity of retrieved items
         .skip((page - 1) * ITEMS_PER_PAGE)
         .limit(ITEMS_PER_PAGE)
     );
   })
   .then(products => {
     res.render("shop/product-list", {
       prods: products,
       pageTitle: "All Products",
       path: "/products",
       currentPage: page,
       hasNextPage: ITEMS_PER_PAGE * page < totalItems,
       hasPreviousPage: page > 1,
       nextPage: page + 1,
       previousPage: page - 1,
       lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
     });
   })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  //Getting the page number from query params
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numberOfProducts => {
      totalItems = numberOfProducts;
      return (
        Product.find()
          //Skipping the items that should be on previous page
          //and limiting the quantity of retrieved items
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      );
    })
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  //Adding products to the cart
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      // console.log(result)
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  //Taking all cart items and moving it to an order
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(item => {
        return { quantity: item.quantity, product: { ...item.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error("No order found!"));
      }
      if (!order.user.userId.toString() === req.user._id.toString()) {
        return next(new Error("Unauthorized!"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      //Defining how this content should be sent to the client
      res.setHeader("Content-Disposition", "inline; filename=" + invoiceName);

      //This is a 'readable' stream that can be piped into a writeable stream
      //'Stream' means that nodeJS doesn't need to pause the execution and wait
      //for file to be read entirely but it can be sent in chunks
      pdfDoc.pipe(fs.createWriteStream(invoicePath));

      //Response happens to be a writeable stream so it can accept streams
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true
      });

      pdfDoc.text("------------------------------------------------------");
      let totalPrice = 0;

      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("---------------------------------------------");
      pdfDoc.fontSize(20).text("Total price: $" + totalPrice);

      pdfDoc.end();
    })
    .catch(err => console.log(err));
};
