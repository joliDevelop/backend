const express = require("express");
const router = express.Router();

const mailTestController = require("../controllers/mailTestController");

router.post("/test-email", mailTestController.sendTestEmail);

module.exports = router;