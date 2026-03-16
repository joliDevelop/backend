const request = require("supertest");
const app = require("../src/app");

describe("Mail test endpoint", () => {
  it("debe enviar un correo de prueba correctamente", async () => {
    const res = await request(app)
      .post("/api/mail/test-email")
      .send({
        to: "sistemas@joli.com.mx",
        subject: "Prueba",
        text: "Hola"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.message).toBe("Correo de prueba enviado correctamente");
  });
});