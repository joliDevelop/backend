const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const LADA_REGEX = /^\+\d{1,4}$/;
const TELEFONO_REGEX = /^\d{10}$/;

exports.validatePreRegisterFields = (body = {}) => {
  const cleanNombre = String(body.nombre || "").trim();
  const cleanApellidoP = String(body.apellidoP || "").trim();
  const cleanApellidoM = String(body.apellidoM || "").trim();
  const cleanEdad = Number(body.edad);
  const cleanEmail = String(body.email || "").trim().toLowerCase();
  const cleanLada = String(body.lada || "").trim();
  const cleanTelefono = String(body.telefono || "").trim();

  if (
    !cleanNombre ||
    !cleanApellidoP ||
    !cleanApellidoM ||
    !cleanEdad ||
    !cleanEmail ||
    !cleanLada ||
    !cleanTelefono
  ) {
    return {
      ok: false,
      status: 400,
      response: { ok: false, message: "Todos los campos son obligatorios" }
    };
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return {
      ok: false,
      status: 400,
      response: { ok: false, message: "Email inválido" }
    };
  }

  if (!LADA_REGEX.test(cleanLada)) {
    return {
      ok: false,
      status: 400,
      response: { ok: false, message: "Lada inválida" }
    };
  }

  if (!TELEFONO_REGEX.test(cleanTelefono)) {
    return {
      ok: false,
      status: 400,
      response: { ok: false, message: "Teléfono inválido" }
    };
  }

  return {
    ok: true,
    data: {
      cleanNombre,
      cleanApellidoP,
      cleanApellidoM,
      cleanEdad,
      cleanEmail,
      cleanLada,
      cleanTelefono
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
    cleanEmail: String(body.email).toLowerCase(),
    cleanCode: String(body.code)
  };
};

exports.validatePassword = (body) => {
  if (body.password !== body.confirmPassword)
    throw { status: 400, response: { ok: false, message: "No coinciden" } };

  return {
    cleanEmail: String(body.email).toLowerCase(),
    cleanPassword: body.password
  };
};