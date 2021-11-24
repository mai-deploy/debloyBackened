const usersModel = require("../../../db/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "748391034640-4faj5hc4s827b2h6k3c9cni55uq46djh.apps.googleusercontent.com"
);

const login = (req, res) => {
  const password = req.body.password;
  const email = req.body.email.toLowerCase();
  usersModel
    .findOne({ email })
    .exec()
    .then(async (result) => {
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `The email doesn't exist`,
        });
      }
       console.log(result)
      if (!result.isActive) {
        return res.status(401).json({
          messag: "Your Email has not been verified yet.",
        });
      }
      try {
        const valid = await bcrypt.compare(password, result.password);
        if (!valid) {
          return res.status(403).json({
            success: false,
            message: `The password you’ve entered is incorrect`,
          });
        }
        const payload = {
          userId: result._id,
        };

        const options = {
          expiresIn: "60m",
        };

        const token = await jwt.sign(payload, process.env.SECRET, options);
        res.status(200).json({
          success: true,
          message: `Email and Password are correct`,
          token: token,
        });
      } catch (error) {
        throw new Error(error.message);
      }
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server Error`,
        err: err,
      });
    });
};
const loginWithGoogle = async (req, res) => {
  const tokenId = req.body.tokenId;
  client
    .verifyIdToken({
      idToken: tokenId,
      audience:
        "748391034640-4faj5hc4s827b2h6k3c9cni55uq46djh.apps.googleusercontent.com",
    })
    .then((response) => {
      console.log(response);
      const { email_verified, name, email } = response.payload;
      if (email_verified) {
        usersModel.findOne({ email }).then(async (result) => {
          // console.log(result);
          if (result) {
            try {
              const valid = await bcrypt.compare(
                email + process.env.SECRET,
                result.password
              );
              if (!valid) {
                return res.status(403).json({
                  success: false,
                  message: "Password incorrect",
                });
              }
              const payload = {
                firstName: result.userName,
                userId: result._id,
              };

              const options = {
                expiresIn: "2h",
              };
              const token = jwt.sign(payload, process.env.SECRET, options);
              return res.status(200).json({
                success: true,
                message: "login successfuly",
                token: token,
              });
            } catch (error) {
              console.log("newError");
            }
          } else {
            console.log("newuser");
            let password = email + process.env.SECRET;
            const newuser = new usersModel({
              firstName: name,
              email,
              password,
            });

            newuser
              .save()
              .then((result) => {
                const payload = {
                  firstName: result.firstName,
                  userId: result._id,
                };

                const options = {
                  expiresIn: "2h",
                };
                const token = jwt.sign(payload, process.env.SECRET, options);
                return res.status(200).json({
                  success: true,
                  message: "login successfuly",
                  token: token,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  success: false,
                  message: `Server Error`,
                  err: err,
                });
              });
          }
        });
      }
    });
};
module.exports = {
  login,
  loginWithGoogle,
};
