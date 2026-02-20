const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware"); // usa el nombre REAL del archivo

// Registro
router.post("/register", userController.registerUser);

// Login (aquí se genera el JWT)
router.post("/login", userController.loginUser);

// Ruta protegida para probar el token
router.get("/me", auth, (req, res) => {
  res.status(200).json({
    message: "Ruta protegida OK",
    userFromToken: req.user,
  });
});

module.exports = router;
