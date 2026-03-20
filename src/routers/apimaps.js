// Define las rutas para obtener información de Google Maps mediante el controlador correspondiente
// Expone el endpoint para consultar reseñas de un negocio
const express = require("express");
const router = express.Router();
const apimapsController = require("../controllers/apimapsController");


router.get("/google-reviews", apimapsController.getGoogleReviews);


module.exports = router;



