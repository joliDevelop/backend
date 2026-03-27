const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

exports.validateEmailData = (body) => {
  const to = String(body.to || "").trim().toLowerCase();

  if (!to) {
    throw {
      status: 400,
      response: { ok: false, message: "Email requerido", field: "to" }
    };
  }

  if (!EMAIL_REGEX.test(to)) {
    throw {
      status: 400,
      response: { ok: false, message: "Email inválido", field: "to" }
    };
  }

  const subject = String(body.subject || "Correo de prueba Joli").trim();
  const text = String(body.text || "Correo de prueba").trim();

  const html =
    body.html ||
    `<h2>Correo de prueba</h2><p>Destino: ${to}</p>`;

  return {
    cleanTo: to,
    cleanSubject: subject,
    cleanText: text,
    htmlContent: html
  };
};