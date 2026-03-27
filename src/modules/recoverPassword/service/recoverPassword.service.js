const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const repository = require("../repository/recoverPassword.repository");
const {
  validateEmail,
  validateResetPassword
} = require("../utils/recoverPassword.validators");

const {
  buildResetLink
} = require("../utils/recoverPassword.helpers");

const transporter = require("../../../config/mailer");

exports.forgotPassword = async (body) => {
  const cleanEmail = validateEmail(body);

  const user = await repository.findUserByEmail(cleanEmail);
  if (!user) {
    throw { status: 404, response: { ok: false, message: "Usuario no encontrado" } };
  }

  await repository.deleteTokensByEmail(cleanEmail);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await repository.createToken(cleanEmail, token, expiresAt);

  const resetLink = buildResetLink(token);

  await transporter.sendMail({
    to: cleanEmail,
    subject: "Recuperación",
    html: `<a href="${resetLink}">Restablecer</a>`
  });

  return {
    ok: true,
    message: "Correo enviado"
  };
};

exports.validateResetToken = async ({ token }) => {
  if (!token) {
    throw { status: 400, response: { ok: false, message: "Token requerido" } };
  }

  const resetToken = await repository.findToken(token);

  if (!resetToken) {
    throw { status: 404, response: { ok: false, message: "Token inválido" } };
  }

  if (resetToken.expiresAt < new Date()) {
    await repository.deleteToken(resetToken._id);
    throw { status: 410, response: { ok: false, message: "Token expirado" } };
  }

  return { ok: true, message: "Token válido" };
};

exports.resetPassword = async (body) => {
  const { cleanToken, cleanPassword } = validateResetPassword(body);

  const resetToken = await repository.findToken(cleanToken);

  if (!resetToken) {
    throw { status: 404, response: { ok: false, message: "Token inválido" } };
  }

  if (resetToken.expiresAt < new Date()) {
    await repository.deleteToken(resetToken._id);
    throw { status: 410, response: { ok: false, message: "Token expirado" } };
  }

  const user = await repository.findUserByEmail(resetToken.email);
  if (!user) {
    throw { status: 404, response: { ok: false, message: "Usuario no encontrado" } };
  }

  const hashedPassword = await bcrypt.hash(cleanPassword, 10);

  await repository.updatePassword(user, hashedPassword);
  await repository.deleteTokensByEmail(resetToken.email);

  return {
    ok: true,
    message: "Contraseña actualizada"
  };
};