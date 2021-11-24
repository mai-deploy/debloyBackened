const Post = require("../../db/models/posts");
const Comment = require("../../db/models/comments");
const User = require("../../db/models/user");
const { populate } = require("../../db/models/posts");

const getAllFriendsPosts = async (req, res) => {
  const id = req.token.userId;
  await User.findById(id).then((result) => {
    result.folowees.forEach(async (f) => {
      const frindPost = await Post.find({ user: f });
      await res.json({success:true,message:frindPost});
    });
  });
};

const getAllPosts = (req, res) => {
  Post.find({}).populate("user")
    .then((result) => {
      if (!result.length) {
        return res.status(404).json({
          success: false,
          message: "No posts yet",
        });
      }
      res.status(200).json({
        success: true,
        message: "all the posts",
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

const createNewPost = (req, res) => {
 date = req.body.date
//  console.log(req.body,"Mai testing")
  const user = req.token.userId;
  const { body } = req.body;
  const newPost = new Post({
    body,
    user,
    date
  });

  newPost
    .save()
    .then((result) => res.status(201).json({ success: true, message: result }))
    .catch((err) =>
      res.status(500).json({ success: false, message: "Server Error" })
    );
};

const updatePostById = (req, res) => {
  const _id = req.params.id;

  Post.findByIdAndUpdate(_id, req.body, { new: true }) //req.body is what you send via frontend
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `The Post with id ${_id} was not found`,
        });
      }
      res.status(202).json({
        success: true,
        message: `Post with id ${_id} has been updated`,
        article: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server Error`,
        err: err,
      });
    });
};

const deletePostById = (req, res,next) => {
  const _id = req.params.id;
  Post.findByIdAndDelete(_id)
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `The post with id: ${_id} was not found`,
        });
      }
      res.status(200).json({
        success: true,
        message: `Deleted post with the id of:  ${_id}`,
      });
      next();
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server Error`,
        err: err,
      });
    });
    
};

const getPostById = (req, res) => {
  const _id = req.params.id;
  Post.findById(_id)
   .populate({ path: 'comments', populate: { path: 'commenter' }})
   .populate("user")
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `No Post Found with this ${_id}`,
        });
      }
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

const likeDislikeToPost = (req, res, next) => {
  const _id = req.params.id;
  const curruntuser = req.token.userId;;
  Post.findById(_id).then((result) => {
    if (!result.likes.includes(curruntuser)) {
      Post.updateOne({ _id: _id }, { $push: { likes: curruntuser },likesCounter: result.likesCounter + 1}).exec();
      // res.status(200).json("like sccesfully");
    } else {
      Post.updateOne({ _id: _id }, { $pull: { likes: curruntuser }, likesCounter: result.likesCounter - 1 }).exec();
      // res.status(200).json("Dislike sccesfully");
    }
    next();
  });  
};

module.exports = {
  createNewPost,
  getAllPosts,
  getPostById,
  updatePostById,
  deletePostById,
  likeDislikeToPost,
  getAllFriendsPosts,
};
