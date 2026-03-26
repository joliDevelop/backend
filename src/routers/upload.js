// Define rutas para manejo de imágenes (subir, eliminar, listar) usando GCS
// Actualmente solo expone endpoint GET para listar imágenes del bucket
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const uploadController = require("../controllers/uploadController");

router.get("/imagenes", uploadController.getimagenes);

module.exports = router;