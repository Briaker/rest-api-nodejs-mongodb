const { body, sanitizeBody } = require("express-validator");
const UserModel = require("#app/models/UserModel");

const validators = {
  factory: {
    email: () => body("email")
      .isLength({ min: 1 })
      .trim()
      .withMessage("Email must be specified.")
      .isEmail()
      .withMessage("Email must be a valid email address."),
    firstName: () => body("firstName")
      .isLength({ min: 1 })
      .trim()
      .withMessage("First name must be specified.")
      .isAlphanumeric()
      .withMessage("First name has non-alphanumeric characters."),
    lastName: () => body("lastName")
      .isLength({ min: 1 })
      .trim()
      .withMessage("Last name must be specified.")
      .isAlphanumeric()
      .withMessage("Last name has non-alphanumeric characters."),
    password: (min, message) => body("password")
      .isLength({ min: min })
      .trim()
      .withMessage(message),
    otp: () => body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified.")
  }
};

module.exports.registerValidator = [
  validators.factory.firstName(),
  validators.factory.lastName(),
  validators.factory.email()
    .custom((value) => {
      return UserModel.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("E-mail already in use");
        }
      });
    }),
  validators.factory.password(6, "Password must be 6 characters or greater."),
  sanitizeBody("firstName").escape(),
  sanitizeBody("lastName").escape(),
  sanitizeBody("email").escape(),
  sanitizeBody("password").escape()
];

module.exports.loginValidator = [
  validators.factory.email(),
  validators.factory.password(1, "Password must be specified."),
  sanitizeBody("email").escape(),
  sanitizeBody("password").escape()
];

module.exports.confirmValidator = [
  validators.factory.email(),
  validators.factory.otp(),
  sanitizeBody("email").escape(),
  sanitizeBody("otp").escape(),
];

module.exports.resendConfirmValidator = [
  validators.factory.email(),
  sanitizeBody("email").escape(),
];
