const express = require("express");


const {
getTrends
} =require("../controllers/trending")

// middlewares
const authentication = require("../middlewares/authentication");

//router:
const trendsRouter = express.Router();

//routes:
trendsRouter.get("/", getTrends);



module.exports = trendsRouter;
