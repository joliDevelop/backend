const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/usuarios");
const PasswordResetToken = require("../models/passwordResetToken");
const transporter = require("../config/mailer");

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PASSWORD_REGEX =
  /^(?=.*[0-7])(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`]).{6,}$/;

function buildResetLink(token) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${baseUrl}/reset-password?token=${token}`;
}

function buildPasswordValidationError() {
  return {
    ok: false,
    message:
      "La contraseña debe tener mínimo 6 caracteres, al menos un número y un carácter especial",
    field: "password",
  };
}

// =========================
// 1) SOLICITAR RECUPERACIÓN
// =========================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El correo es obligatorio",
        field: "email",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de correo inválido",
        field: "email",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    // Respuesta neutra por seguridad
    if (!user) {
      return res.status(200).json({
        ok: true,
        message:
          "Si el correo existe, se enviaron instrucciones para recuperar la contraseña",
      });
    }

    await PasswordResetToken.deleteMany({ email: cleanEmail });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const resetLink = buildResetLink(token);

    await PasswordResetToken.create({
      email: cleanEmail,
      token,
      expiresAt,
    });

    const info = await transporter.sendMail({
      from: `"Joli" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Recuperación de contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Recuperar contraseña</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <p>
            <a href="${resetLink}" target="_blank" rel="noopener noreferrer">
              Restablecer contraseña
            </a>
          </p>
          <p>Este enlace expira en 15 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    });

    console.log("Correo de recuperación enviado:", info.response);

    return res.status(200).json({
      ok: true,
      message:
        "Si el correo existe, se enviaron instrucciones para recuperar la contraseña",
    });
  } catch (err) {
    console.error("Error forgotPassword:", err);

    return res.status(500).json({
      ok: false,
      message: "Error al procesar la recuperación de contraseña",
      error: err.message,
    });
  }
};

// =========================
// 2) VALIDAR TOKEN
// =========================

exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        ok: false,
        message: "El token es obligatorio",
      });
    }

    const resetToken = await PasswordResetToken.findOne({ token });

    if (!resetToken) {
      return res.status(404).json({
        ok: false,
        message: "Token inválido o inexistente",
      });
    }

    if (resetToken.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id });

      return res.status(410).json({
        ok: false,
        message: "El enlace de recuperación expiró",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Token válido",
    });
  } catch (err) {
    console.error("Error validateResetToken:", err);

    return res.status(500).json({
      ok: false,
      message: "Error al validar el token de recuperación",
      error: err.message,
    });
  }
};

// =========================
// 3) RESTABLECER CONTRASEÑA
// =========================

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: "Token, contraseña y confirmación son obligatorios",
      });
    }

    const cleanToken = String(token).trim();
    const cleanPassword = String(password);
    const cleanConfirmPassword = String(confirmPassword);

    if (cleanPassword !== cleanConfirmPassword) {
      return res.status(400).json({
        ok: false,
        message: "Las contraseñas no coinciden",
        field: "confirmPassword",
      });
    }

    if (!PASSWORD_REGEX.test(cleanPassword)) {
      return res.status(400).json(buildPasswordValidationError());
    }

    const resetToken = await PasswordResetToken.findOne({ token: cleanToken });

    if (!resetToken) {
      return res.status(404).json({
        ok: false,
        message: "Token inválido o inexistente",
      });
    }

    if (resetToken.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id });

      return res.status(410).json({
        ok: false,
        message: "El enlace de recuperación expiró",
      });
    }

    const user = await User.findOne({ email: resetToken.email });

    if (!user) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id });

      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await PasswordResetToken.deleteMany({ email: resetToken.email });

    return res.status(200).json({
      ok: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (err) {
    console.error("Error resetPassword:", err);

    if (err?.name === "ValidationError") {
      return res.status(400).json({
        ok: false,
        message: "Validación fallida",
        details: err.errors,
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Error al restablecer la contraseña",
      error: err.message,
    });
  }
};