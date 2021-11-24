const mongoose = require("mongoose");

const trendSchema = mongoose.Schema({
  post:{type:mongoose.Schema.Types.ObjectId,ref:"Post"},
});

module.exports = mongoose.model("Trend", trendSchema);
