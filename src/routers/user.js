const express = require("express");
const router = express.Router();

const registerController = require("../controllers/registerController");
const userController = require("../controllers/userController");
const mailTestController = require("../controllers/mailTestController");
const auth = require("../middlewares/authMiddleware");

router.post("/pre-registro", registerController.preRegisterUser);
router.post("/enviar-codigo", registerController.sendVerificationCode);
router.post("/verificar-codigo", registerController.verifyCode);
router.post("/crear-contrasena", registerController.createPassword);
router.post("/login", userController.loginUser);

// test mail
router.post("/test-email", mailTestController.sendTestEmail);

router.get("/me", auth, (req, res) => {
  res.status(200).json({
    message: "Ruta protegida OK",
    userFromToken: req.user,
  });
});

module.exports = router;