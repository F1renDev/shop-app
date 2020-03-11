const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    check("email", "Please, enter a valid email").isEmail(),
    check("password", "Password must be at least 5 characters").isLength({
      min: 3
    })
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    //This check() call cheks if this is a valid email address
    check("email")
      .isEmail()
      //Changes the msg property of the generated error to a custom one
      .withMessage("Please, enter a valid email")
      //A custom validator that forbids using the "test@test.com" email
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email is forbidden");
        // }
        //Not creating a user if a given email is already taken
        return User.findOne({ email: value }).then(userObj => {
          if (userObj) {
            return Promise.reject("Email already exists");
          }
        });
      }),
    //This check() call cheks if this is a valid password
    check("password", "Password must be at least 5 characters").isLength({
      min: 3
    }),
    //This check() call cheks if passwords do match
    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match ");
      }
      return true;
    })
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

module.exports = router;
