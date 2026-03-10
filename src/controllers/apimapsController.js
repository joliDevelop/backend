const axios = require("axios");

exports.getGoogleReviews = async (req, res) => {
  try {

    const placeId = process.env.GOOGLE_MAPS_PLACE_ID;
    const apiKey = process.env.GOOGLE_MAPS_KEY;

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`;

    const { data } = await axios.get(url);

    if (data.status !== "OK") {
      return res.status(400).json({
        error: "No se pudieron obtener las reseñas",
        details: data
      });
    }

    res.json({
      negocio: data.result.name,
      rating: data.result.rating,
      total_reviews: data.result.user_ratings_total,
      reviews: data.result.reviews || []
    });

  } catch (error) {

    console.error("Error obteniendo reseñas:", error.message);

    res.status(500).json({
      error: "Error interno al obtener reseñas"
    });

  }
};
