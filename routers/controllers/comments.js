const Comment =require("../../db/models/comments");
const Post = require("../../db/models/posts");
const User = require("../../db/models/user")

const getCommentById = (req, res) => {
  const _id = req.params.id;
  Comment.findById(_id)
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `No comment Found with this ${_id}`,
        });
      }
      res.status(200).json({
        success: true,
        message: `The comment with ${_id}`,
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

}


const createNewComment = async (req, res) => {
  const commenter = req.token.userId;
  const id = req.params.id
  const { comment } = req.body;
  const newComment = new Comment({
    comment,
    commenter,
  });
   const user = await User.findById(commenter)
  newComment
    .save()
    .then((result) =>Post.findByIdAndUpdate(id , {$push:{comments:result._id}}))
    .then(()=>{
      let ayeshe = {comment:newComment.comment, commenter:user, date:newComment.date, _id:newComment._id} //populate bashar.com
      res.status(201).json({ 
        success: true,
        message: "seccess add comment",
        commentAdded: ayeshe,  
       })
    })
    .catch((err) =>
      res.status(404).json({ success: false, message: "something went wrong while creating a new comment" })
    );    
}



 const updateCommentById = (req, res) => {

  const _id = req.params.id;
  const {body} = req.body
 
  Comment.findByIdAndUpdate(_id, {comment:body}, { new: true })
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `The Comment with id ${_id} was not found`,
        });
      }
      res.status(202).json({
        success: true,
        message: `Comment with id ${_id} has been updated`,
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

}


const deleteCommentById = (req, res) => {
const id=req.params.id;
const postId=req.params.postId;
  Comment.findByIdAndDelete({_id:id})
    .then((result) => {
      if (!result) {
        return res.status(404).json({  success: false, message: `The comment with id: ${id} Not Found comment`, });
      }   
      Post.findByIdAndUpdate(postId ,{$pull:{comments:result._id}} , { new: true })
    })
    .then(resul => res.status(200).json({success: true, message: `Success Delete comment:` }))
    
    .catch((err) => {
      res.status(404).json({
        success: false,
        message: `Server Error`,
        err: err
      });
    });
 

}


module.exports = {
    createNewComment,
    updateCommentById,
    deleteCommentById,
    getCommentById
  };
  
