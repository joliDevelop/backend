const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["admin", "cliente", "vendedor", "lotero", "asesor"],
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);
