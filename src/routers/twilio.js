const express = require("express");
const router = express.Router();
const twilioController = require("../controllers/twilioController");

router.post("/send-code", twilioController.sendCode);
router.post("/verify-code", twilioController.verifyCode);

module.exports = router;
