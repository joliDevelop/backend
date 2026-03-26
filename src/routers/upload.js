const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const uploadController = require("../controllers/uploadController");

// router.post('/upload', upload.single('file'), subirImagen);
// router.delete('/upload/:fileName', eliminarImagen);
router.get("/imagenes", uploadController.getimagenes);

module.exports = router;