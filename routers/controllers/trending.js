const Trend = require("../../db/models/trending");
const Post = require("../../db/models/posts");
const { deleteOne } = require("../../db/models/trending");

let changedPost
let maker
const getTrends = (req, res) => {
  Trend.find({}).sort({ likesCounter: -1 })
  
    .populate("post").populate({ path: 'post', populate: { path: 'user' }}).populate("user")
    .then(async (result) => {
      // let ayeshe = {comment:newComment.comment, commenter:user, date:newComment.date, _id:newComment._id}
      if (result.length < 3) {
        await Trend.remove({});
        const trends = [];
        Post.find({}).populate("user")
          .sort({ likesCounter: -1 })
          .limit(3)
          .then((resultP) => {
            trends.push(resultP[0]);
            trends.push(resultP[1]);
            trends.push(resultP[2]);
          // console.log("trendsmraish", trends)
            const newtrend1 = new Trend({
              post: resultP[0]._id,
              likesCounter: resultP[0].likesCounter,
              userAvatar: resultP[0].user.avatar
            });
            // console.log("test",resultP[0].user.avatar)
            const newtrend2 = new Trend({
              post: resultP[1]._id,
              likesCounter: resultP[1].likesCounter,
              userAvatar: resultP[1].user.avatar
            });
            const newtrend3 = new Trend({
              post: resultP[2]._id,
              likesCounter: resultP[2].likesCounter,
              userAvatar: resultP[2].user.avatar
            });

            newtrend1.save();
            newtrend2.save();
            newtrend3.save();
            // console.log("status 1" + res.status);
            return res.status(201).json({
              success: true,
              message: `Trending posts.`,
              trends: trends,
            });
          })
          .catch((err) => {
            console.log("err 1" + err);
          });
      }
      // console.log("status 2" + res.status);
      return res.status(200).json({
        success: true,
        message: `Trending posts.`,
        trends: result
      });
    })
    .catch((err) => {
      console.log("err 2" + err);
    });
};

const reGetTrends = (req, res) => {
  Trend.find({})
  
  .populate("post").populate({ path: 'post', populate: { path: 'user' }}).populate("user")
    .then(async (result) => {
      await Trend.remove({});
      const trends = [];
      Post.find({}).populate("user")
        .sort({ likesCounter: -1 })
        .limit(3)
        .then((resultP) => {
          trends.push(resultP[0]);
          trends.push(resultP[1]);
          trends.push(resultP[2]);

          changedPost = resultP.find((p) => { return p._id === req.params.id })

          const newtrend1 = new Trend({
            post: resultP[0]._id,
            likesCounter: resultP[0].likesCounter,
            userAvatar: resultP[0].user.avatar
          });
          const newtrend2 = new Trend({
            post: resultP[1]._id,
            likesCounter: resultP[1].likesCounter,
            userAvatar: resultP[1].user.avatar
          });
          const newtrend3 = new Trend({
            post: resultP[2]._id,
            likesCounter: resultP[2].likesCounter,
            userAvatar: resultP[2].user.avatar
          });

          newtrend1.save();
          newtrend2.save();
          newtrend3.save();
          // console.log("status 1" + res.status);
          return res.status(201).json({
            success: true,
            message: `Trending posts.`,
            trends: trends,
            post: changedPost
          });
        })
        .catch((err) => {
          console.log("err 1" + err);
        });
     // console.log("status 2" + res.status);
      // return res.status(200).json({
      //   success: true,
      //   message: `Trending posts.`,
      //   trends: result,
      // });
    })
    .catch((err) => {
      console.log("err 2" + err);
    });
};

const addNewAndDeleteOld = (req, res) => {
  const postId = req.params.id;
  let post
  // let isChanged = false;
  //Check if post exists in trends
  Trend.findOne({ post: postId })
  .populate("post").populate({ path: 'post', populate: { path: 'user' }}).populate("user")
    .then(async (result) => {
      post = await Post.findOne({ _id: postId }).populate("user");
      if (!result) {
        // console.log("we entered the unknown",result)
        const trends = await Trend.find({}).populate("post");
        console.log("trends",trends)
        for (let i = 0; i < 3; i++) {
          console.log("momo",trends[i])
          if (trends[i].post.likesCounter < post.likesCounter) {
            return reGetTrends(req, res);
            // console.log("before break")
            // break;
          }
        }
        return res.status(200).json({
          success: true,
          changedTrend: false,
          xx: "flfafel",
          post: post
        });
      } else {
        // console.log("status 4" + res.status);
        return res.status(201).json({
          success: true,
          changedTrend: false,
          xx: "batata",
          post: post
        });
      }
    })
    .catch((err) => {
      console.log(err);
      // console.log("status 5" + res.status);
      return res.status(500).json({
        success: false,
        message: `Eroor`,
      });
    });
};

const shoshoDelete = (req, res) => {
  // console.log("we entered shosho");
  // we enetered here
  const _id = req.params.id;
  // console.log("shoshoDelete", _id);
  Trend.findOne({ post: _id })
    .then((result) => {
      console.log("bashar", result);
      if (result) {
        // console.log("beforedeleteone", result);
        Trend.deleteOne({ post: _id }).then((result) => {
          // re-call getTrends   to replace deleted post
          if (result) {
            // console.log("after deleteone result", result);
            getTrends(req, res);
          } //headers problem
        });
      }
    })
    // .catch
    .catch((err) => {
      console.log(err);
    });
};

module.exports = { getTrends, addNewAndDeleteOld, shoshoDelete };
