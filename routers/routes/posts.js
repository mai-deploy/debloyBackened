const express = require("express");
const {
  addNewAndDeleteOld,shoshoDelete
} = require("../controllers/trending")

const {
  createNewPost,
  getAllPosts,
  getPostById,
  updatePostById,
  deletePostById,
  likeDislikeToPost,
  getAllFriendsPosts
} = require("../controllers/posts");
const {
  getCommentById,
  createNewComment,
  updateCommentById,
  deleteCommentById,
} =require("../controllers/comments")

// middlewares
const authentication = require("../middlewares/authentication");

//router:
const postsRouter = express.Router();

//routes:
postsRouter.get("/", getAllPosts);
postsRouter.get("/getpostbyid/:id",authentication, getPostById);
postsRouter.post("/",authentication ,createNewPost);
postsRouter.put("/:id",authentication, updatePostById);
postsRouter.get("/timeline", authentication, getAllFriendsPosts);
postsRouter.put("/:id/like",authentication, likeDislikeToPost, addNewAndDeleteOld);
postsRouter.delete("/deletepost/:id",authentication, deletePostById, shoshoDelete);

//edit the routes
postsRouter.post("/:id/comment",authentication, createNewComment);
postsRouter.get("/comment/:id", authentication, getCommentById);
postsRouter.put("/:id/comment", authentication, updateCommentById);
postsRouter.delete("/:postId/comment/:id", authentication, deleteCommentById);


module.exports = postsRouter;
