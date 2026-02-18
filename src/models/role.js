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
