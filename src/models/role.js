// Define el esquema de roles del sistema con valores permitidos para control de acceso
// Permite asignar y validar los roles únicos que puede tener un usuario
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["admin", "cliente", "seguro", "pension", "inversion", "asesor", "retiro"],
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);