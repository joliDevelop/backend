 /* hola */
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");
const app = express();

// Conexión a base de datos
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas de usuarios
const userRoutes = require("./routers/user");
app.use("/api/users", userRoutes);

// Rutas de administrador
const adminRoutes = require("./routers/admin");
app.use("/api/admin", adminRoutes);

// Ruta base (landing)
app.get("/", (req, res) => {
  res.send(`<html><h1>App Joli Backend</h1></html>`);
});

// Puerto
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;