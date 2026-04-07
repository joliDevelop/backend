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
  await repository.deleteVerificationCodes(data.email);

  return {
    ok: true,
    message: "Tu preregistro se ha guardado",
    nextStep: "sendVerificationCode"
  };
};

exports.sendVerificationCode = async (body) => {
  const { cleanEmail, cleanChannel } = validateSendCode(body);

  const preRegister = await repository.getPreRegister(cleanEmail);
  if (!preRegister) {
    throw { status: 404, response: { ok: false, message: "No existe un preregistro para este correo" } };
  }

  if (preRegister.expiresAt < new Date()) {
    await repository.cleanExpiredProcess(preRegister._id, cleanEmail);
    throw { status: 410, response: buildExpiredProcessResponse() };
  }

  const code = generateSixDigitCode();
  const formattedCode = String(code).split("").join(" ");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await repository.createVerificationCode(cleanEmail, code, cleanChannel, expiresAt);

  if (cleanChannel === "email") {
    try {
      await transporter.sendMail({
        from: `"Joli" <${process.env.EMAIL_USER}>`,
        to: cleanEmail,
        subject: "Tu código de verificación de Joli",
        html: `
          <div style="margin:0; padding:40px 20px; background-color:#f1f5f9; font-family:Arial, Helvetica, sans-serif; color:#334155;">
            <div style="max-width:760px; margin:0 auto; background-color:#ffffff; border-radius:24px; padding:56px 60px; box-sizing:border-box;">

              <h1 style="margin:0 0 28px; font-size:34px; line-height:1.2; text-align:center; color:#1e293b; font-weight:700;">
                Verificación de cuenta
              </h1>

              <p style="margin:0 0 22px; font-size:16px; line-height:1.7; color:#475569;">
                Hola,
              </p>

              <p style="margin:0 0 32px; font-size:16px; line-height:1.7; color:#475569;">
                Usa el siguiente código para verificar tu cuenta en <strong>Joli</strong>:
              </p>

              <div style="margin:0 auto 32px; max-width:320px; background-color:#a5f3fc; border-radius:18px; padding:28px 24px; text-align:center;">
                <span style="display:inline-block; font-size:48px; line-height:1; font-weight:700; letter-spacing:6px; color:#0f172a;">
                  ${formattedCode}
                </span>
              </div>

              <p style="margin:0 0 32px; font-size:16px; line-height:1.7; text-align:center; color:#475569;">
                Este código expira en <strong>10 minutos</strong>.
              </p>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:32px 0;">

              <p style="margin:0 0 18px; text-align:center; font-size:15px; line-height:1.7; color:#64748b;">
                Si no solicitaste este código, puedes ignorar este mensaje.
              </p>

              <p style="margin:0; text-align:center; font-size:14px; color:#94a3b8;">
                © 2026 Joli. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error("Error al enviar correo de verificación:", error.message);
      throw { status: 500, response: { ok: false, message: "Error al enviar el correo" } };
    }
  } else {
    throw { status: 501, response: { ok: false, message: "Canal de envio no implementado" } };
  }

  return {
    ok: true,
    message: "Código enviado a tu correo",
    nextStep: "verifyCode"
  };
};

exports.verifyCode = async (body) => {
  const { email, code } = validateVerifyCode(body);

  const verification = await repository.getVerification(email, code);

  if (!verification) {
    throw { status: 400, response: { ok: false, message: "Código inválido" } };
  }

  if (verification.expiresAt < new Date()) {
    await repository.deleteVerification(verification._id);
    throw { status: 410, response: { ok: false, message: "Código expirado" } };
  }

  await repository.markCodeAsVerified(verification);
  await repository.markPreRegisterAsVerified(email);

  return {
    ok: true,
    message: "Código verificado",
    nextStep: "createPassword"
  };
};

exports.createPassword = async (body) => {
  const { email, password } = validatePassword(body);

  const preRegister = await repository.getPreRegister(email);
  if (!preRegister) {
    throw { status: 404, response: { ok: false, message: "No existe preregistro" } };
  }

  if (!preRegister.isCodeVerified) {
    throw { status: 400, response: { ok: false, message: "Verifica el código primero" } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const role = await repository.getClienteRole();
  const user = await repository.createUser(preRegister, hashedPassword, role);

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "5d"
  });

  await repository.cleanProcess(preRegister._id, email);

  return {
    ok: true,
    message: "Usuario creado",
    user: user,
    token
  };
};