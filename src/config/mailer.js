// Configura y exporta un transporter de Nodemailer usando Gmail y credenciales del entorno
// Permite enviar correos electrónicos desde la aplicación de forma segura
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = transporter;