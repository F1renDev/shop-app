const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;
  req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
    })
    .then(result => {
      console.log("Created product");
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect("/");
  }
  const prodId = req.params.productId;
  req.user
    .getProducts({ where: { id: prodId } })
    .then(products => {
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product
      });
    })
    .catch();
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updateDesc = req.body.description;
  Product.findByPk(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updateDesc;
      product.imageUrl = updatedImageUrl;
      //If the prodct doesn't exist - creates a new one
      // Updates the existing product otherwise
      return product.save();
    })
    .then(result => {
      console.log("UPDATED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin products",
        path: "/admin/products"
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      return product.destroy();
    })
    .then(result => {
      console.log("DELETED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};
