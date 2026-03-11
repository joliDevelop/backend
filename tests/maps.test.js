process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const app = require("../src/app");

describe("Google Reviews endpoint", () => {

  test("Debe obtener reseñas reales desde Google", async () => {
    const res = await request(app)
      .get("/api/maps/google-reviews");

    expect(res.statusCode).toBe(200);

    // propiedades principales
    expect(res.body).toHaveProperty("negocio");
    expect(res.body).toHaveProperty("rating_general");
    expect(res.body).toHaveProperty("total_reviews");
    expect(res.body).toHaveProperty("reviews");

    // reviews debe ser array
    expect(Array.isArray(res.body.reviews)).toBe(true);

    // debe haber al menos una review
    expect(res.body.reviews.length).toBeGreaterThan(0);

    const review = res.body.reviews[0];

    // propiedades de cada review
    expect(review).toHaveProperty("author_name");
    expect(review).toHaveProperty("rating");
    expect(review).toHaveProperty("text");
  });

});