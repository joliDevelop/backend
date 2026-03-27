const mapsRepository = require("../repository/maps.repository");

exports.getGoogleReviews = async () => {
  const data = await mapsRepository.getPlaceDetails();

  const allReviews = data.result.reviews || [];

  const reviews = allReviews
    .filter(r => r.text && r.text.trim().length > 0)
    .sort((a, b) => b.time - a.time)
    .map(r => ({
      author_name: r.author_name,
      rating: r.rating,
      text: r.text.trim(),
      time: r.time
    }));

  return {
    negocio: data.result.name,
    rating_general: data.result.rating,
    total_reviews: data.result.user_ratings_total,
    total_reviews_con_comentario: reviews.length,
    reviews
  };
};