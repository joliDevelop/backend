// Define las rutas principales de autenticación y usuarios: 
// registro, login, recuperación de contraseña y rutas protegidas

// Integra controladores y middleware para gestionar el flujo completo de acceso y seguridad del sistema

const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");

// ----- mis rutas
const userController = require("../controller/user.controller");

// router.post("/users", userController.getUsers);

module.exports = router;