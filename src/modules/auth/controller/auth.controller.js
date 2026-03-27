// Maneja el inicio de sesión validando credenciales y generando un token JWT para el usuario autenticado
// Verifica formato de correo, compara la contraseña con bcrypt y devuelve los datos básicos del usuario
const authService = require("../service/auth.service");

exports.loginUser = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: result.user,
      token: result.token,
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno",
    });
  }
};