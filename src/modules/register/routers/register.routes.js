// Define las rutas principales de autenticación y usuarios: 
// registro, login, recuperación de contraseña y rutas protegidas

// Integra controladores y middleware para gestionar el flujo completo de acceso y seguridad del sistema

const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");

// ----- mis rutas
const registerController = require("../controller/register.controller");

router.post("/pre-registro", registerController.preRegisterUser);
router.post("/enviar-codigo", registerController.sendVerificationCode);
router.post("/verificar-codigo", registerController.verifyCode);
router.post("/crear-contrasena", registerController.createPassword);

module.exports = router;