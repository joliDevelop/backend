// modules/contact/routers/contact.routes.js
const express = require("express");
const router = express.Router();
const contactController = require("../controller/contact.controller");

router.post("/", contactController.createContact);
router.get("/", contactController.getAllContacts);
router.get("/:id", contactController.getContactById);

module.exports = router;