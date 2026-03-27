const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");
const routes = require("./routes");

const app = express();

// middlewares globales
app.use(cors());
app.use(express.json());

// Endpoints
app.use('/api', routes);

// endpoint base
app.get("/", (req, res) => {
  res.send("<html><h1>App Joli Backend</h1></html>");
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