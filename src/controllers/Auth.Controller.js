const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const expressValidator = require("express-validator");

const mailer = require("#app/helpers/mailer");
const utility = require("#app/helpers/utility");
const UserModel = require("#app/models/UserModel");
const apiResponse = require("#app/helpers/apiResponse");
const { constants } = require("#app/helpers/constants");
const {
  registerValidator,
  loginValidator,
  confirmValidator,
  resendConfirmValidator
} = require("#app/controllers/Auth.Validator");


exports.register = [
  ...registerValidator,
  (req, res) => {
    try {
      const errors = expressValidator.validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        bcrypt.hash(req.body.password, 10, async (error, hash) => {
          if (error) {
            return apiResponse.ErrorResponse(res, error);
          }

          const otp = utility.randomNumber(4);
          const user = new UserModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            confirmOTP: otp
          });

          // Html email body TODO: create separate module for email bodies and use templates
          const html = `<p>Please Confirm your Account.</p><p>OTP: ${otp}</p>`;

          try {
            await mailer.send(
              constants.confirmEmails.from,
              req.body.email,
              "Confirm Account",
              html
            );
            await user.save();
          }
          catch (error) {
            return apiResponse.ErrorResponse(res, error);
          }

          let userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          };

          return apiResponse.successResponseWithData(
            res,
            "Registration Success.",
            userData
          );
        });
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error);
    }
  },
];


exports.login = [
  ...loginValidator,
  (req, res) => {
    try {
      const errors = expressValidator.validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        UserModel.findOne({ email: req.body.email }).then((user) => {
          if (user) {
            //Compare given password with db's hash.
            bcrypt.compare(
              req.body.password,
              user.password,
              (err, same) => {
                if (same) {
                  //Check account confirmation.
                  if (user.isConfirmed) {
                    // Check User's account active or not.
                    if (user.status) {
                      let userData = {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                      };
                      //Prepare JWT token for authentication
                      const jwtPayload = userData;
                      const jwtData = {
                        expiresIn: process.env.JWT_TIMEOUT_DURATION,
                      };
                      const secret = process.env.JWT_SECRET;
                      //Generated JWT token with Payload and secret.
                      userData.token = jwt.sign(jwtPayload, secret, jwtData);
                      return apiResponse.successResponseWithData(
                        res,
                        "Login Success.",
                        userData
                      );
                    } else {
                      return apiResponse.unauthorizedResponse(
                        res,
                        "Account is not active. Please contact admin."
                      );
                    }
                  } else {
                    return apiResponse.unauthorizedResponse(
                      res,
                      "Account is not confirmed. Please confirm your account."
                    );
                  }
                } else {
                  return apiResponse.unauthorizedResponse(
                    res,
                    "Wrong Email or Password."
                  );
                }
              }
            );
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Wrong Email or Password."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.verifyConfirm = [
  ...confirmValidator,
  async (req, res) => {
    try {
      const errors = expressValidator.validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const user = await UserModel.findOne({ email: req.body.email });

        if (user) {
          if (!user.isConfirmed) {
            if (user.confirmOTP == req.body.otp) {
              try {
                user.isConfirmed = 1;
                user.confirmOTP = null;
                await user.save();
              }
              catch (error) {
                return apiResponse.ErrorResponse(res, error);
              }

              return apiResponse.successResponse(
                res,
                "Account confirmed success."
              );
            } else {
              return apiResponse.unauthorizedResponse(
                res,
                "Otp does not match"
              );
            }
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Account already confirmed."
            );
          }
        } else {
          return apiResponse.unauthorizedResponse(
            res,
            "Specified email not found."
          );
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];


exports.resendConfirmOtp = [
  ...resendConfirmValidator,
  (req, res) => {
    try {
      const errors = expressValidator.validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var query = { email: req.body.email };
        UserModel.findOne(query).then((user) => {
          if (user) {
            //Check already confirm or not.
            if (!user.isConfirmed) {
              // Generate otp
              let otp = utility.randomNumber(4);
              // Html email body
              let html =
                "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
              // Send confirmation email
              mailer
                .send(
                  constants.confirmEmails.from,
                  req.body.email,
                  "Confirm Account",
                  html
                )
                .then(function () {
                  user.isConfirmed = 0;
                  user.confirmOTP = otp;
                  // Save user.
                  user.save(function (err) {
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    }
                    return apiResponse.successResponse(
                      res,
                      "Confirm otp sent."
                    );
                  });
                });
            } else {
              return apiResponse.unauthorizedResponse(
                res,
                "Account already confirmed."
              );
            }
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Specified email not found."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
