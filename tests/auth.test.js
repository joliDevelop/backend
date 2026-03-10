process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const app = require("../src/app");

describe("Auth endpoints", () => {

  test("Registro de usuario", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({
        nombre: "messi",
        apellidoP: "ronaldo",
        apellidoM: "Dev",
        edad: 25,
        email: "messi@test.com",
        password: "messi@123",
        confirmPassword: "messi@123",
        lada: "+52",
        telefono: "4416611232"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user"); 
  });

  test("Login usuario", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "messi@test.com",
        password: "messi@123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
  

});