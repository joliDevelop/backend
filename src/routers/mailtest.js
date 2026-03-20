// Define la ruta para enviar correos de prueba mediante el controlador de mail
// Expone un endpoint POST para validar el envío de emails desde el backend
const express = require("express");
const router = express.Router();

const mailTestController = require("../controllers/mailTestController");

router.post("/test-email", mailTestController.sendTestEmail);

module.exports = router;