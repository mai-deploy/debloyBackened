const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  comment: { type: String, required: true },
  commenter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: {type:Date ,default:new Date(Date.now())},
});

module.exports = mongoose.model("Comment", commentSchema);
