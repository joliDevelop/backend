// Configura multer para manejar uploads en memoria (sin guardar en disco)
// Limita tamaño de archivo a 5MB para evitar abusos o crashes por archivos grandes
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;