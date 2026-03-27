const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const repository = require("../repository/register.repository");
const {
  validatePreRegisterFields,
  validateSendCode,
  validateVerifyCode,
  validatePassword
} = require("../utils/register.validators");

const {
  generateSixDigitCode,
  buildExpiredProcessResponse,
  buildUserResponse
} = require("../utils/register.helpers");

const transporter = require("../../../config/mailer");

exports.preRegisterUser = async (body) => {
  const validation = validatePreRegisterFields(body);
  if (!validation.ok) throw validation;

  const data = validation.data;
  

  await repository.validateUserDoesNotExist(data);

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await repository.upsertPreRegister(data, expiresAt);
  await repository.deleteVerificationCodes(data.cleanEmail);

  return {
    ok: true,
    message: "Tu preregistro se ha guardado",
    nextStep: "sendVerificationCode"
  };
};

exports.sendVerificationCode = async (body) => {
  const { cleanEmail, cleanChannel } = validateSendCode(body);

  const preRegister = await repository.getPreRegister(cleanEmail);
  if (!preRegister) throw { status: 404, response: { ok: false, message: "No existe un preregistro para esté correo" } };

  if (preRegister.expiresAt < new Date()) {
    await repository.cleanExpiredProcess(preRegister._id, cleanEmail);
    throw { status: 410, response: buildExpiredProcessResponse() };
  }

  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await repository.createVerificationCode(cleanEmail, code, cleanChannel, expiresAt);

  if (cleanChannel === "email") {
    await transporter.sendMail({
      to: cleanEmail,
      subject: "Código",
      html: `<h1>${code}</h1>`
    });
  } else {
    throw { status: 501, response: { ok: false, message: "Canal de envio no implementado" } }; // whatsapp, sms
  }

  return {
    ok: true,
    message: "Código enviado a tu correo",
    nextStep: "verifyCode"
  };
};

exports.verifyCode = async (body) => {
  const { cleanEmail, cleanCode } = validateVerifyCode(body);

  const verification = await repository.getVerification(cleanEmail, cleanCode);
  if (!verification) throw { status: 400, response: { ok: false, message: "Código inválido" } };

  if (verification.expiresAt < new Date()) {
    await repository.deleteVerification(verification._id);
    throw { status: 410, response: { ok: false, message: "Código expirado" } };
  }

  await repository.markCodeAsVerified(verification);
  await repository.markPreRegisterAsVerified(cleanEmail);

  return {
    ok: true,
    message: "Código verificado",
    nextStep: "createPassword"
  };
};

exports.createPassword = async (body) => {
  const { cleanEmail, cleanPassword } = validatePassword(body);

  const preRegister = await repository.getPreRegister(cleanEmail);
  if (!preRegister) throw { status: 404, response: { ok: false, message: "No existe preregistro" } };

  if (!preRegister.isCodeVerified) {
    throw { status: 400, response: { ok: false, message: "Verifica el código primero" } };
  }

  const hashedPassword = await bcrypt.hash(cleanPassword, 10);

  const role = await repository.getClienteRole();

  const user = await repository.createUser(preRegister, hashedPassword, role);

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "5d"
  });

  await repository.cleanProcess(preRegister._id, cleanEmail);

  return {
    ok: true,
    message: "Usuario creado",
    user: buildUserResponse(user),
    token
  };
};