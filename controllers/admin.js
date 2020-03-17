const { validationResult } = require("express-validator");

const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  //If user is not logged in - redirecting to the login page
  if (!req.session.isLoggedIn) {
    return res.redirect("/");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

//Creating a product
exports.postAddProduct = (req, res, next) => {
  const { title, description, price } = req.body;
  const image = req.file;
  //If the image was rejected - returning this same prepopulated page
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: "Attached file is not an image",
      validationErrors: []
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  //A path to the stored file
  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      console.log("Created product");
      res.redirect("/admin/products");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};

//Editing a product with pre-populated fields
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
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

//Updating the edited product
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updateDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updateDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      //If the creator of the product is not the currently logged in user
      //he can't edit and is redirected
      console.log(product);
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updateDesc;
      if (image) {
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        console.log("UPDATED PRODUCT");
        res.redirect("/admin/products");
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

//Getting all the products
exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin products",
        path: "/admin/products"
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

//Deleting product by id
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  //If the creator of the product is not the currently logged in user
  //he can't delete the product
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      //Returning next(error) call with an error passed to it makes it skip all following
      //middlewares and move to the error handling middleware
      return next(error);
    });
};
