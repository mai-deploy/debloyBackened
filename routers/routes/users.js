const express = require("express");
const {
  getUserById,
  register,
  follwoUnfollwo,
  searchUsersByName,
  updateUserById,
  checkIsFollower,
  verification
} = require("../controllers/users");

const { login,loginWithGoogle } = require("../controllers/auth/login");

const usersRouter = express.Router();

const authentication = require('../middlewares/authentication')

usersRouter.post("/", register);
usersRouter.post("/login", login);
usersRouter.get('/confirmation/:email/',verification)
usersRouter.post("/googleLogin",loginWithGoogle);
usersRouter.get("/:idU/:idF", authentication, checkIsFollower)
usersRouter.post("/search", authentication, searchUsersByName);
usersRouter.get("/:id", authentication, getUserById);
usersRouter.put("/test/:id/follow", authentication, follwoUnfollwo); 
usersRouter.put("/:id",authentication, updateUserById);

module.exports = usersRouter;
