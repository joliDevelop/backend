// Middleware de autorización que permite acceso solo a usuarios con roles específicos
// Verifica que el usuario autenticado tenga un rol incluido en los roles permitidos
module.exports = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: sin rol asignado" });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: rol insuficiente" });
    }

    next();
  };
};