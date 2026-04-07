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
  from: `"Joli" <${process.env.EMAIL_USER}>`,
  to: cleanEmail,
  subject: "Recupera tu contraseña - Joli",
  html: `
    <div style="margin:0; padding:40px 20px; background-color:#f1f5f9; font-family:Arial, Helvetica, sans-serif; color:#334155;">
      <div style="max-width:760px; margin:0 auto; background-color:#ffffff; border-radius:24px; padding:56px 60px; box-sizing:border-box;">

        <h1 style="margin:0 0 28px; font-size:34px; line-height:1.2; text-align:center; color:#1e293b; font-weight:700;">
          Recuperación de contraseña
        </h1>

        <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#475569;">
          Hola,
        </p>

        <p style="margin:0 0 32px; font-size:16px; line-height:1.7; color:#475569;">
          Recibimos una solicitud para restablecer tu contraseña en <strong>Joli</strong>.
        </p>

        <div style="text-align:center; margin:32px 0;">
          <a href="${resetLink}" 
             style="display:inline-block; background-color:#0f172a; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:12px; font-size:16px; font-weight:600;">
            Restablecer contraseña
          </a>
        </div>

        <p style="margin:0 0 32px; font-size:15px; line-height:1.7; text-align:center; color:#475569;">
          Este enlace es válido por <strong>15 minutos</strong>.
        </p>

        <hr style="border:none; border-top:1px solid #e2e8f0; margin:32px 0;">

        <p style="margin:0 0 18px; text-align:center; font-size:14px; line-height:1.7; color:#64748b;">
          Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>

        <p style="margin:0; text-align:center; font-size:14px; color:#94a3b8;">
          © 2026 Joli. Todos los derechos reservados.
        </p>

      </div>
    </div>
  `
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