// Define el esquema de pre-registro con validaciones de datos y expiración automática (TTL)
// Almacena información temporal del usuario antes de completar el registro final
const mongoose = require("mongoose");

const preRegisterSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    apellidop: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "El apellido paterno debe tener al menos 2 caracteres"],
      maxlength: [50, "El apellido paterno no puede exceder 50 caracteres"],
    },
    apellidom: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "El apellido materno debe tener al menos 2 caracteres"],
      maxlength: [50, "El apellido materno no puede exceder 50 caracteres"],
    },
    edad: {
      type: Number,
      required: true,
      min: 18,
      max: 120,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Formato de correo inválido"],
    },
    lada: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+\d{1,4}$/, "Formato de lada inválido"],
    },
    telefono: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos"],
    },
    isCodeVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL: elimina automáticamente el pre-registro cuando expire
preRegisterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PreRegister", preRegisterSchema);