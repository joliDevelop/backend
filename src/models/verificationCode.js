// Define el esquema para códigos de verificación con expiración automática (TTL)
// Permite validar usuarios por distintos canales (email, sms, whatsapp) y controlar su estado
const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Formato de correo inválido"],
    },
    code: {
      type: String,
      default: null,
      trim: true,
      minlength: 6,
      maxlength: 6,
    },
    channel: {
      type: String,
      required: true,
      enum: ["email", "sms", "whatsapp"],
      default: "email",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// TTL: elimina automáticamente el código cuando expire
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índices útiles para búsquedas del flujo
verificationCodeSchema.index({ email: 1 });
verificationCodeSchema.index({ email: 1, verified: 1 });

module.exports = mongoose.model("VerificationCode", verificationCodeSchema);