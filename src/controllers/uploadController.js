const { bucket } = require("../config/gcs");

// exports.subirImagen = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 ok: false,
//                 message: 'No se recibió ningún archivo',
//             });
//         }

//         const file = req.file;

//         const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
//         const blob = bucket.file(fileName);

//         const blobStream = blob.createWriteStream({
//             resumable: false,
//             metadata: {
//                 contentType: file.mimetype,
//             },
//         });

//         await new Promise((resolve, reject) => {
//             blobStream.on('error', reject);
//             blobStream.on('finish', resolve);
//             blobStream.end(file.buffer);
//         });

//         return res.status(201).json({
//             ok: true,
//             message: 'Imagen subida correctamente',
//             fileName,
//             gcsPath: `gs://${bucket.name}/${fileName}`,
//             publicUrl: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
//         });
//     } catch (error) {
//         console.error('Error al subir imagen:', error);

//         return res.status(500).json({
//             ok: false,
//             message: 'Error al subir la imagen',
//             error: error.message,
//         });
//     }
// };

// exports.eliminarImagen = async (req, res) => {
//     try {
//         const { fileName } = req.params;

//         await bucket.file(fileName).delete();

//         return res.status(200).json({
//             ok: true,
//             message: 'Imagen eliminada correctamente',
//         });
//     } catch (error) {
//         console.error('Error al eliminar imagen:', error);

//         return res.status(500).json({
//             ok: false,
//             message: 'Error al eliminar la imagen',
//             error: error.message,
//         });
//     }
// };

exports.getimagenes = async (req, res) => {
    try {
        const [exists] = await bucket.exists();

        if (!exists) {
            return res.status(404).json({
                ok: false,
                message: "El bucket no existe o no es accesible",
                bucket: bucket.name,
            });
        }

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
            bucket: bucket.name,
            error: error.message,
        });
    }
};