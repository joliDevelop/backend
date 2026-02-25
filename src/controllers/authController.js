
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;



    

    // Esperamos: Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token requerido (Bearer)" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("Falta JWT_SECRET en variables de entorno");
      return res.status(500).json({ message: "Configuración incompleta del servidor" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos info del token para usar en rutas
    req.user = decoded; // { userId, email, rol?, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
