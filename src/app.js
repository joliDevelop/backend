const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");
const app = express();

connectDB();

// Middlewares necesarios para Postman
app.use(cors());
app.use(express.json());

// Conectar rutas (si este require truena, tu problema está en routers/user.js o controllers)
const userRoutes = require("./routers/user");
app.use("/api/users", userRoutes);

// Tu landing
app.get("/", (req, res) => {
  res.send(`<html> ... tu html ... </html>`);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
