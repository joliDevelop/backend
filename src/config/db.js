// Establece la conexión a MongoDB usando Mongoose y variables de entorno
// Maneja errores de conexión y notifica el estado en consola
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error de conexión a MongoDB:", error.message);
  }
};

module.exports = connectDB;