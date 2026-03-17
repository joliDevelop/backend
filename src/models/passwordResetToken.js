const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Formato de correo inválido"],
    },
    token: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL: elimina automáticamente el token al expirar
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índices útiles
passwordResetTokenSchema.index({ email: 1 });
passwordResetTokenSchema.index({ token: 1 });

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);