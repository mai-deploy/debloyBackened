var nodemailer = require("nodemailer");
const app = require("../../main");
const User = require("../../db/models/user");
require("dotenv").config();

const register = (req, res) => {
  const { firstName, gender, email, password } = req.body;
  const user = new User({
    firstName,
    email,
    gender,
    password,
  });

  user
    .save()
    .then((result) => {
      var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
      var mailOptions = {
        from: "moroco.social.apps@gmail.com ",
        to: email,
        subject: "Account Verification Link",
        text:
          "Hello " +
          firstName +
          ",\n\n" +
          "Please verify your account by clicking the link: \n" +
          "http://" +
          req.headers.host +
          "/users/confirmation/" +
          email +
          "\n\nThank You!\n",
      };

      transporter.sendMail(mailOptions, function (err) {
        if (err) {
          return res.status(500).send({
            msg: "Technical Issue!, Please click on resend for verify your Email.",
          });
        }
        return res
          .status(200)
          .send(
            "A verification email has been sent to " +
              email +
              ". It will be expire after one day. If you not get verification Email click on resend token."
          );
      });

      res.status(201).json({
        success: true,
        message: `User Created Successfully`,
        User: result,
      });
    })
    .catch((err) => {
      if (err.keyPattern) {
        return res.status(409).json({
          success: false,
          message: `The email already exists`,
        });
      }
      res.status(500).json({
        success: false,
        message: `Server Error`,
        err: err,
      });
    });
};

const getUserById = (req, res) => {
  const id = req.params.id;
  User.findById({ _id: id })
    .populate("followers")
    .then((result) => {
      res.status(200).json({
        success: true,
        message: `the user with id =>${id}`,
        posts: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "server error",
        err: err,
      });
    });
};

const follwoUnfollwo = (req, res) => {
  const _id = req.params.id;

  const curruntuser = req.token.userId;

  User.findById(curruntuser).then((result) => {
    if (!result.followers.includes(_id)) {
      User.updateOne(
        { _id: curruntuser },
        { $push: { followers: _id } }
      ).exec();
      res.status(200).json("follow sccesfully");
    } else {
      User.updateOne(
        { _id: curruntuser },
        { $pull: { followers: _id } }
      ).exec();
      res.status(200).json("unfollow sccesfully");
    }
  });
};

const checkIsFollower = (req, res) => {
  const _idU = req.token.userId;
  const _idF = req.params.idF;
  User.findById(_idU)
    .then((result) => {
      if (result.followers.includes(_idF)) {
        return res.status(200).json({
          success: true,
          message: `User of id: ${_idF} is following User of id: ${_idU}`,
        });
      }
      res.status(201).json({
        success: false,
        message: `User of id: ${_idF} is NOT FOLLOWING User of id: ${_idU}`,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server Error Mraish`,
        err: err,
      });
    });
};
const updateUserById = (req, res) => {
  const { lastName, age, email, gender, avatar } = req.body;
  console.log("reqbody", req.body);
  const _id = req.params.id;
  User.findByIdAndUpdate(
    { _id: _id },
    {
      $push: { album: avatar },
      avatar: avatar,
      gender: gender,
      email: email,
      age: age,
      lastName: lastName,
    },
    { new: true }
  )
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `The User => ${_id} not found`,
        });
      }
      console.log("mrs mai", result);
      res.status(200).json({
        success: true,
        message: `The post with ${_id}`,
        post: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "server error",
        err: err,
      });
    });
};

const searchUsersByName = (req, res) => {
  const name = req.query.name;
  User.find({
    $or: [
      {
        firstName: {
          $regex: name,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: name,
          $options: "i",
        },
      },
    ],
  })
    .then((result) => {
      if (!result.length) {
        return res.status(400).json({
          success: false,
          message: "Name doesn't exist",
        });
      }
      res.status(200).json({
        success: true,
        users: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server Error`,
      });
    });
};

const verification = (req, res) => {
  User.findOne({ email: req.params.email }).then((result) => {
    // not valid user
    if (!result) {
      return res.status(401).send({
        msg: "We were unable to find a user for this verification. Please SignUp!",
      });
    }
    // user is already verified
    else if (result.isVerified) {
      return res
        .status(200)
        .send("User has been already verified. Please Login");
    }
    // verify user
    else {
      // change isVerified to true
      User.findByIdAndUpdate(result._id, { isActive: true }, { new: true })
        .then((result) => {
          return res
            .status(200)
            .json("Your account has been successfully verified");
        })
        .catch((error) => {
          console.log(error)
          return res.status(500).json({ msg: error });
        });
    }
  });
};

module.exports = {
  getUserById,
  register,
  follwoUnfollwo,
  searchUsersByName,
  updateUserById,
  checkIsFollower,
  verification,
};
