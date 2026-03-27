const mapsService = require("../service/maps.service");

exports.getGoogleReviews = async (req, res) => {
  try {
    const data = await mapsService.getGoogleReviews();

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Error interno",
      details: error.message
    });
  }
};