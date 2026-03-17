const User = require("../models/usuarios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Role = require("../models/role");



exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errores = [];

    if (!email) errores.push("El correo es obligatorio");
    if (!password) errores.push("La contraseña es obligatoria");

    if (errores.length > 0) {
      return res.status(400).json({
        message: "Datos inválidos",
        errores
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Formato de correo inválido",
        campo: "email"
      });
    }

    // Busca usuario por email
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: "Correo no encontrado",
        campo: "email"
      });
    }

    // Comparación con bcrypt
    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Contraseña incorrecta",
        campo: "password"
      });
    }

    // Token
    const payload = { userId: user._id };
    if (user.rol) payload.rol = user.rol;

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "365d" });

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        _id: user._id,
        nombre: user.nombre,
        apellidoP: user.apellidop,
        apellidoM: user.apellidom,
        edad: user.edad,
        numesocial: user.numesocial,
        email: user.email,
        lada: user.lada,
        telefono: user.telefono,
        ...(user.rol ? { rol: user.rol } : {}),
      },
      token,
    });
  } catch (err) {
    console.error("Error loginUser:", err);
    return res.status(500).json({ message: "Error interno al iniciar sesión" });
  }
};