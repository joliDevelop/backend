const axios = require("axios");

exports.getPlaceDetails = async () => {
  const placeId = process.env.GOOGLE_MAPS_PLACE_ID;
  const apiKey = process.env.GOOGLE_MAPS_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&reviews_sort=most_relevant&language=es&key=${apiKey}`;

  const { data } = await axios.get(url);

  if (data.status !== "OK") {
    throw new Error("Error obteniendo datos de Google");
  }

  return data;
};