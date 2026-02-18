

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const protect = require("../middlewares/authMiddleware");
const rolesPermitidos = require("../middlewares/roleMiddleware");

router.get(
  "/dashboard",
  protect,
  rolesPermitidos("admin"),
  adminController.getDashboardData
);

module.exports = router;
