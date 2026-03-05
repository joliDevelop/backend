process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../src/app");

describe("Auth endpoints", () => {

  test("Registro de usuario", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({
        nombre: "Hector",
        apellidoP: "Cervantes",
        apellidoM: "Dev",
        edad: 25,
        email: "hector@test.com",
        password: "123456",
        confirmPassword: "123456",
        lada: "+52",
        telefono: "4421234500"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
  });

  test("Login usuario", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "hector@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

});