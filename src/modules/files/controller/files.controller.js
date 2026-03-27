const { bucket } = require("../../../config/gcs");

exports.getimagenes = async (req, res) => {
    try {
        const [files] = await bucket.getFiles();

        const imagenes = files.map((file) => ({
            name: file.name,
            url: `gs://${bucket.name}/${file.name}`,
        }));

        return res.status(200).json({
            ok: true,
            bucket: bucket.name,
            imagenes,
        });
    } catch (error) {
        console.error("Error al obtener imágenes:", error);

        return res.status(500).json({
            ok: false,
            message: "Error al obtener imágenes",
            error: error.message,
        });
    }
};