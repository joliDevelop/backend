const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
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
    edad: { type: Number, required: true, min: 18, max: 120 },
    password: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Formato de correo inválido"],
    },
    lada: {
      type: String,
      trim: true,
      match: [/^\+\d{1,4}$/, "Formato de lada inválido"],
      default: "",
    },
    telefono: {
      type: String,
      unique: true,
      sparse: true,
      match: [
        /^\d{10}$/,
        "El teléfono debe tener exactamente 10 dígitos numéricos",
      ],
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usuario", usuarioSchema);
