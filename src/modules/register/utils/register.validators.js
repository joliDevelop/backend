const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const LADA_REGEX = /^\+\d{1,4}$/;
const TELEFONO_REGEX = /^\d{10}$/;

exports.validatePreRegisterFields = (body = {}) => {
  const nombre = String(body.nombre).trim();
  const apellidoP = String(body.apellidoP).trim();
  const apellidoM = String(body.apellidoM).trim();
  const edad = Number(body.edad);
  const email = String(body.email).trim().toLowerCase();
  const lada = String(body.lada).trim();
  const telefono = String(body.telefono).trim();
  if (
    !nombre ||
    !apellidoP ||
    !apellidoM ||
    !edad ||
    !email ||
    !lada ||
    !telefono 
  ) {
    return {
      ok: false,
      status: 400,
      response: { ok: false, message: "Todos los campos son obligatorios" }
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      status: 400,
      response: { ok: false, message: "Email inválido" }
    };
  }

  if (!LADA_REGEX.test(lada)) {
    return {
      ok: false,
      status: 400,
      response: { ok: false, message: "Lada inválida" }
    };
  }

  if (!TELEFONO_REGEX.test(telefono)) {
    return {
      ok: false,
      status: 400,
      response: { ok: false, message: "Teléfono inválido" }
    };
  }

  return {
    ok: true,
    data: {
      nombre,
      apellidoP,
      apellidoM,
      edad,
      email,
      lada,
      telefono
    }
  };
};

exports.validateSendCode = (body) => {
  const cleanEmail = String(body.email || "").trim().toLowerCase();
  const cleanChannel = String(body.channel || "").trim();

  if (!EMAIL_REGEX.test(cleanEmail)) {
    throw { status: 400, response: { ok: false, message: "Email inválido" } };
  }

  return { cleanEmail, cleanChannel };
};

exports.validateVerifyCode = (body) => {
  return {
    email: String(body.email).toLowerCase(),
    code: String(body.code)
  };
};

exports.validatePassword = (body) => {
  if (body.password !== body.confirmPassword)
    throw { status: 400, response: { ok: false, message: "No coinciden" } };

  return {
    email: String(body.email).toLowerCase(),
    password: body.password
  };
};