process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const app = require("../src/app");

describe("Google Reviews endpoint", () => {

  test("Debe obtener reseñas reales desde Google", async () => {
    const res = await request(app)
      .get("/api/maps/google-reviews");

    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty("negocio");
    expect(res.body).toHaveProperty("rating");
    expect(res.body).toHaveProperty("total_reviews");
    expect(res.body).toHaveProperty("reviews");

    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body.reviews.length).toBeGreaterThan(0);

    const review = res.body.reviews[0];

    expect(review).toHaveProperty("author_name");
    expect(review).toHaveProperty("rating");
    expect(review).toHaveProperty("text");
  });

});