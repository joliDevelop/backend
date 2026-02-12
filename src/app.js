const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");
const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send(`<html>
  <head>
    <title>Joli</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Inter", sans-serif;
        background: radial-gradient(circle at top left, #dbeafe, #bfdbfe, #93c5fd);
        overflow: hidden;
      }

      .message-container {
        text-align: center;
        padding: 60px 80px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 20px 50px rgba(37, 99, 235, 0.15);
        animation: fadeIn 1s ease-out forwards;
        opacity: 0;
      }

      h1 {
        margin: 0;
        font-size: 64px;
        font-weight: 700;
        letter-spacing: 4px;
        background: linear-gradient(90deg, #2563eb, #1e40af);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .footer {
        margin-top: 25px;
        font-size: 16px;
        color: #475569;
        font-weight: 500;
        letter-spacing: 1px;
      }

      @keyframes fadeIn {
        to {
          opacity: 1;
          transform: translateY(0);
        }
        from {
          opacity: 0;
          transform: translateY(20px);
        }
      }
    </style>
  </head>

  <body>
    <div class="message-container">
      <h1>JOLI</h1>
      <div class="footer">Desarrollado por Wo-aw</div>
    </div>
  </body>
</html>
  `);
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;