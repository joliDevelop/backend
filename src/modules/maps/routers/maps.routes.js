// Define las rutas para obtener información de Google Maps mediante el controlador correspondiente
// Expone el endpoint para consultar reseñas de un negocio
const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const apimapsController = require("../controller/maps.controller");

router.get("/google-reviews", apimapsController.getGoogleReviews);

module.exports = router;



