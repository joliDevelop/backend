const axios = require("axios");

exports.getGoogleReviews = async (req, res) => {
  try {
    const placeId = process.env.GOOGLE_MAPS_PLACE_ID;
    const apiKey = process.env.GOOGLE_MAPS_KEY;

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&reviews_sort=newest&language=es&key=${apiKey}`;

    const { data } = await axios.get(url);

    if (data.status !== "OK") {
      return res.status(400).json({
        error: "No se pudieron obtener las reseñas",
        details: data
      });
    }

    const reviews = (data.result.reviews || [])
      .filter((review) => {
        const text = review.text?.trim();
        return text && text.length > 0;
      })
      .map((review) => ({
        author_name: review.author_name,
        author_url: review.author_url,
        language: review.language,
        original_language: review.original_language,
        profile_photo_url: review.profile_photo_url,
        rating: review.rating,
        relative_time_description: review.relative_time_description,
        text: review.text.trim(),
        time: review.time,
        translated: review.translated
      }))
      .sort((a, b) => {
        // Primero las más recientes
        if (b.time !== a.time) {
          return b.time - a.time;
        }

        // Si tienen la misma fecha, primero mejor puntuación
        return b.rating - a.rating;
      });

    return res.json({
      negocio: data.result.name,
      rating: data.result.rating,
      total_reviews: data.result.user_ratings_total,
      total_reviews_con_comentario: reviews.length,
      reviews
    });
  } catch (error) {
    console.error("Error obteniendo reseñas:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Error interno al obtener reseñas",
      details: error.response?.data || error.message
    });
  }
};