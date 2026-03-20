// Middleware de autenticación que valida el token JWT enviado en el header Authorization
// Decodifica el token y adjunta la información del usuario a la request si es válido
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token requerido (Bearer)" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};