const express = require("express");
const router = express.Router();

const registerController = require("../controllers/registerController");
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

router.post("/registrar", registerController.preRegisterUser);
router.post("/enviar-codigo", registerController.sendVerificationCode);
router.post("/verificar-email", registerController.verifyEmailCode);
router.post("/crear-contraseña", registerController.createPassword);
router.post("/login", userController.loginUser);

router.get("/me", auth, (req, res) => {
  res.status(200).json({
    message: "Ruta protegida OK",
    userFromToken: req.user,
  });
});

module.exports = router;