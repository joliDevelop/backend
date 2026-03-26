// Configura y levanta el servidor Express conectando a la base de datos y registrando rutas y middlewares globales
// Inicializa la aplicación, define endpoints principales y controla el arranque del servidor
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const connectDB = require("./config/db");
const app = express();
// Middlewares globales
app.use(cors());
app.use(express.json());

// rutas 
const userRoutes = require("./routers/user");
const mapsRoutes = require("./routers/apimaps");
const twilioRoutes = require("./routers/twilio");
const mailTestRoutes = require("./routers/mailtest");
const imagesRoutes = require("./routers/upload");

app.use("/api/users", userRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/mail", mailTestRoutes);
app.use("/api/imagenes", imagesRoutes);

app.get("/", (req, res) => {
  res.send(`<html><h1>App Joli Backend</h1></html>`);
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = app;