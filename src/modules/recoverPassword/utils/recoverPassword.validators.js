const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

exports.validateEmail = (body) => {
  const email = String(body.email || "").toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    throw { status: 400, response: { ok: false, message: "Formato de email inválido" } };
  }

  return email;
};

exports.validateResetPassword = (body) => {
  if (body.password !== body.confirmPassword) {
    throw { status: 400, response: { ok: false, message: "No coinciden" } };
  }

  return {
    cleanToken: String(body.token),
    cleanPassword: body.password
  };
};