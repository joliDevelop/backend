// modules/contact/model/contact.model.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    nombre_completo: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    telefono: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    edad: {
      type: Number,
      required: true,
    },
    comentarios: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "contacts",
  }
);

module.exports = mongoose.model("Contact", contactSchema);