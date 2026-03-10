const express = require("express");
const router = express.Router();
const apimapsController = require("../controllers/apimapsController");


router.get("/google-reviews", apimapsController.getGoogleReviews);


module.exports = router;



