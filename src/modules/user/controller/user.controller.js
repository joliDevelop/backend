// Gestiona el flujo completo de registro de usuarios: pre-registro, 
// envío y verificación de código, y creación final con autenticación

// Incluye validaciones, expiración de procesos, hash de contraseña, asignación de rol y generación de JWT
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const Role = require("../models/userRole.model");

  
// 1) geta all users 
exports.getUsers = async (req, res) => {
  try {
  } catch (err) {
  }
};
