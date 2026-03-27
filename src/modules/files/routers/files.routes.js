// Define rutas para manejo de imágenes (subir, eliminar, listar) usando GCS
// Actualmente solo expone endpoint GET para listar imágenes del bucket
const express = require("express");
const router = express.Router();
const file = require("../../../middlewares/files.middleware");
const auth = require("../../../middlewares/auth.middleware");
const filesController = require("../controller/files.controller");

router.get("/imagenes", filesController.getimagenes);

module.exports = router;