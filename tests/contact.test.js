// tests/contact.test.js
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const app = require("../src/app");

describe("Contact endpoints", () => {

  test("Crear contacto con email", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({
        nombre_completo: "Juan Pérez",
        email: "juan@test.com",
        edad: 30,
        comentarios: "Interesado en el servicio",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("contact");
  });

  test("Crear contacto con teléfono", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({
        nombre_completo: "María López",
        telefono: "4411234567",
        edad: 25,
      });

    expect(res.statusCode).toBe(201);
  });

  test("Falla sin teléfono ni correo", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({
        nombre_completo: "Sin contacto",
        edad: 20,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Debes proporcionar al menos un teléfono o correo");
  });

  test("Falla sin edad", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({
        nombre_completo: "Sin edad",
        email: "sinedad@test.com",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("La edad es obligatoria");
  });

  test("Listar contactos", async () => {
    const res = await request(app).get("/api/contact");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("contacts");
  });

});