// Inicializa cliente de Google Cloud Storage usando credenciales automáticas (ADC) y conecta al bucket
// Exporta el bucket para reutilizarlo en controllers sin manejar claves manuales
const { Storage } = require("@google-cloud/storage");

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET;
const bucket = storage.bucket(bucketName);

console.log("Bucket configurado:", bucketName);

module.exports = { bucket };