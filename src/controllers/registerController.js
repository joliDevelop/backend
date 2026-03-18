const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usuarios");
const Role = require("../models/role");
const PreRegister = require("../models/preRegister");
const VerificationCode = require("../models/verificationCode");
const transporter = require("../config/mailer");


// Constantes
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const LADA_REGEX = /^\+\d{1,4}$/;
const TELEFONO_REGEX = /^\d{10}$/;
const VALID_CHANNELS = ["email", "sms", "whatsapp"];
const PASSWORD_REGEX =
  /^(?=.*[0-7])(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`]).{6,}$/;


// Helpers


function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeData(body = {}) {
  return {
    cleanNombre: String(body.nombre || "").trim(),
    cleanApellidoP: String(body.apellidoP || "").trim(),
    cleanApellidoM: String(body.apellidoM || "").trim(),
    cleanEdad: Number(body.edad),
    cleanEmail: String(body.email || "").trim().toLowerCase(),
    cleanLada: String(body.lada || "").trim(),
    cleanTelefono: String(body.telefono || "").trim(),
  };
}

function validatePreRegisterFields(body = {}) {
  const {
    cleanNombre,
    cleanApellidoP,
    cleanApellidoM,
    cleanEdad,
    cleanEmail,
    cleanLada,
    cleanTelefono,
  } = normalizeData(body);

  if (
    !cleanNombre ||
    !cleanApellidoP ||
    !cleanApellidoM ||
    body.edad === undefined ||
    !cleanEmail ||
    !cleanLada ||
    !cleanTelefono
  ) {
    return {
      ok: false,
      status: 400,
      response: {
        ok: false,
        message: "Todos los campos son obligatorios",
      },
    };
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return {
      ok: false,
      status: 400,
      response: {
        ok: false,
        message: "Formato de correo inválido",
        field: "email",
      },
    };
  }

  if (!LADA_REGEX.test(cleanLada)) {
    return {
      ok: false,
      status: 400,
      response: {
        ok: false,
        message: "Formato de lada inválido (ej: +52)",
        field: "lada",
      },
    };
  }

  if (!TELEFONO_REGEX.test(cleanTelefono)) {
    return {
      ok: false,
      status: 400,
      response: {
        ok: false,
        message: "Teléfono inválido (10 dígitos)",
        field: "telefono",
      },
    };
  }

  if (!Number.isFinite(cleanEdad) || cleanEdad < 18 || cleanEdad > 120) {
    return {
      ok: false,
      status: 400,
      response: {
        ok: false,
        message: "Edad inválida (18 a 120)",
        field: "edad",
      },
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
      cleanTelefono,
    },
  };
}

async function getClienteRole() {
  let clienteRole = await Role.findOne({ name: "cliente" }).select("_id");

  if (!clienteRole) {
    clienteRole = await Role.create({ name: "cliente" });
  }

  return clienteRole;
}

function buildExpiredProcessResponse() {
  return {
    ok: false,
    message: "Este proceso ya expiró. Vuelve a iniciarlo.",
  };
}

function buildPasswordValidationError() {
  return {
    ok: false,
    message:
      "La contraseña debe tener mínimo 6 caracteres, al menos un número y un carácter especial",
    field: "password",
  };
}

function buildUserResponse(user) {
  return {
    _id: user._id,
    nombre: user.nombre,
    apellidoP: user.apellidop,
    apellidoM: user.apellidom,
    edad: user.edad,
    email: user.email,
    lada: user.lada,
    telefono: user.telefono,
    role: user.role,
  };
}


// 1) PRE REGISTRO


exports.preRegisterUser = async (req, res) => {
  try {
    const validation = validatePreRegisterFields(req.body);

    if (!validation.ok) {
      return res.status(validation.status).json(validation.response);
    }

    const {
      cleanNombre,
      cleanApellidoP,
      cleanApellidoM,
      cleanEdad,
      cleanEmail,
      cleanLada,
      cleanTelefono,
    } = validation.data;

    const existingUserByEmail = await User.findOne({ email: cleanEmail });
    if (existingUserByEmail) {
      return res.status(409).json({
        ok: false,
        message: "El correo ya está registrado",
        field: "email",
      });
    }

    const existingUserByPhone = await User.findOne({ telefono: cleanTelefono });
    if (existingUserByPhone) {
      return res.status(409).json({
        ok: false,
        message: "El teléfono ya está registrado",
        field: "telefono",
      });
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await PreRegister.findOneAndUpdate(
      { email: cleanEmail },
      {
        nombre: cleanNombre,
        apellidoP: cleanApellidoP,
        apellidoM: cleanApellidoM,
        edad: cleanEdad,
        email: cleanEmail,
        lada: cleanLada,
        telefono: cleanTelefono,
        isCodeVerified: false,
        verifiedAt: null,
        expiresAt,
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    await VerificationCode.deleteMany({ email: cleanEmail });

    return res.status(200).json({
      ok: true,
      message: "Pre-registro guardado correctamente",
      nextStep: "sendVerificationCode",
    });
  } catch (err) {
    console.error("Error preRegisterUser:", err);

    return res.status(500).json({
      ok: false,
      message: "Error en el proceso de pre-registro",
      error: err.message,
    });
  }
};


// 2) ENVIAR CÓDIGO


exports.sendVerificationCode = async (req, res) => {
  try {
    const { email, channel } = req.body;

    if (!email || !channel) {
      return res.status(400).json({
        ok: false,
        message: "Correo y método de envío son obligatorios",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanChannel = String(channel).trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de correo inválido",
        field: "email",
      });
    }

    if (!VALID_CHANNELS.includes(cleanChannel)) {
      return res.status(400).json({
        ok: false,
        message: "Método de envío inválido. Usa: email, sms o whatsapp",
        field: "channel",
      });
    }

    const preRegister = await PreRegister.findOne({ email: cleanEmail });
    if (!preRegister) {
      return res.status(404).json({
        ok: false,
        message: "No existe la información de pre-registro para este correo",
      });
    }

    if (preRegister.expiresAt < new Date()) {
      await PreRegister.deleteOne({ _id: preRegister._id });
      await VerificationCode.deleteMany({ email: cleanEmail });

      return res.status(410).json(buildExpiredProcessResponse());
    }

    const code = generateSixDigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.deleteMany({ email: cleanEmail });

    await VerificationCode.create({
      email: cleanEmail,
      code,
      channel: cleanChannel,
      expiresAt,
      verified: false,
      verifiedAt: null,
    });

    if (cleanChannel === "email") {
     const info = await transporter.sendMail({
  from: `"Joli" <${process.env.EMAIL_USER}>`,
  to: cleanEmail,
  subject: "Código de verificación",
  html: `
    <div style="margin:0; padding:0; background-color:#f4f7fb; font-family: Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb; padding: 40px 16px;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color:#ffffff; border-radius:20px; overflow:hidden;">
              
              <!-- Título -->
              <tr>
                <td align="center" style="padding: 40px 32px 10px;">
                  <h1 style="margin:0; font-size:30px; line-height:1.2; color:#2f3640; font-weight:700;">
                    Verificación de cuenta
                  </h1>
                </td>
              </tr>

              <!-- Texto -->
              <tr>
                <td style="padding: 0 40px;">
                  <p style="margin:0 0 16px; font-size:16px; color:#4b5563;">
                    Hola,
                  </p>

                  <p style="margin:0 0 20px; font-size:16px; color:#4b5563;">
                    Usa el siguiente código para verificar tu cuenta en <strong>Joli</strong>:
                  </p>
                </td>
              </tr>

              <!-- Código -->
              <tr>
                <td align="center" style="padding: 10px 40px 20px;">
                  <div style="
                    display:inline-block;
                    background-color:#f1f5f9;
                    padding:18px 28px;
                    border-radius:12px;
                    font-size:28px;
                    letter-spacing:10px;
                    font-weight:700;
                    color:#111827;
                  ">
                    ${code}
                  </div>
                </td>
              </tr>

              <!-- Expiración -->
              <tr>
                <td align="center" style="padding: 0 40px 25px;">
                  <p style="margin:0; font-size:15px; color:#374151;">
                    Este código expira en <strong>10 minutos</strong>.
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 40px;">
                  <div style="height:1px; background:#e5e7eb;"></div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px 10px;">
                  <p style="margin:0; font-size:13px; color:#6b7280; text-align:center;">
                    Si no solicitaste este código, puedes ignorar este mensaje.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 10px 40px 30px;">
                  <p style="margin:0; font-size:12px; color:#9ca3af; text-align:center;">
                    © ${new Date().getFullYear()} Joli. Todos los derechos reservados.
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </div>
  `,
});

      console.log("Correo enviado:", info.response);
    } else {
      return res.status(501).json({
        ok: false,
        message: `El canal ${cleanChannel} aún no está implementado`,
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Código de verificación enviado correctamente",
      channel: cleanChannel,
      nextStep: "verifyCode",
    });
  } catch (err) {
    console.error("Error sendVerificationCode:", err);

    return res.status(500).json({
      ok: false,
      message: "Error al enviar el código de verificación",
      error: err.message,
    });
  }
};


// 3) VERIFICAR CÓDIGO


exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        ok: false,
        message: "Correo y código son obligatorios",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    const verification = await VerificationCode.findOne({
      email: cleanEmail,
      code: cleanCode,
      verified: false,
    });

    if (!verification) {
      return res.status(400).json({
        ok: false,
        message: "Código inválido",
      });
    }

    if (verification.expiresAt < new Date()) {
      await VerificationCode.deleteOne({ _id: verification._id });

      return res.status(410).json({
        ok: false,
        message: "El código expiró",
      });
    }

    verification.verified = true;
    verification.verifiedAt = new Date();
    verification.code = null;
    await verification.save();

    await PreRegister.findOneAndUpdate(
      { email: cleanEmail },
      {
        isCodeVerified: true,
        verifiedAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

    return res.status(200).json({
      ok: true,
      message: "Código verificado correctamente",
      nextStep: "createPassword",
    });
  } catch (err) {
    console.error("Error verifyCode:", err);

    return res.status(500).json({
      ok: false,
      message: "Error al verificar el código",
      error: err.message,
    });
  }
};


// 4) CREAR CONTRASEÑA Y USUARIO FINAL


exports.createPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: "Correo, contraseña y confirmación son obligatorios",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);
    const cleanConfirmPassword = String(confirmPassword);

    if (cleanPassword !== cleanConfirmPassword) {
      return res.status(400).json({
        ok: false,
        message: "Las contraseñas no coinciden",
        field: "confirmPassword",
      });
    }

    if (!PASSWORD_REGEX.test(cleanPassword)) {
      return res.status(400).json(buildPasswordValidationError());
    }

    const preRegister = await PreRegister.findOne({ email: cleanEmail });
    if (!preRegister) {
      return res.status(404).json({
        ok: false,
        message: "No existe un pre-registro para este correo",
      });
    }

    if (!preRegister.isCodeVerified) {
      return res.status(400).json({
        ok: false,
        message: "Primero debes verificar tu código",
      });
    }

    if (preRegister.expiresAt < new Date()) {
      await PreRegister.deleteOne({ _id: preRegister._id });
      await VerificationCode.deleteMany({ email: cleanEmail });

      return res.status(410).json(buildExpiredProcessResponse());
    }

    const existingUserByEmail = await User.findOne({ email: cleanEmail });
    if (existingUserByEmail) {
      return res.status(409).json({
        ok: false,
        message: "El correo ya está registrado",
        field: "email",
      });
    }

    const existingUserByPhone = await User.findOne({
      telefono: preRegister.telefono,
    });
    if (existingUserByPhone) {
      return res.status(409).json({
        ok: false,
        message: "El teléfono ya está registrado",
        field: "telefono",
      });
    }

    const clienteRole = await getClienteRole();
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const newUser = await User.create({
      nombre: preRegister.nombre,
      apellidop: preRegister.apellidoP,
      apellidom: preRegister.apellidoM,
      edad: preRegister.edad,
      email: preRegister.email,
      password: hashedPassword,
      lada: preRegister.lada,
      telefono: preRegister.telefono,
      isEmailVerified: true,
      registrationCompleted: true,
      role: clienteRole._id,
    });

    const payload = {
      userId: newUser._id,
      role: newUser.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    await PreRegister.deleteOne({ _id: preRegister._id });
    await VerificationCode.deleteMany({ email: cleanEmail });

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      user: buildUserResponse(newUser),
      token,
    });
  } catch (err) {
    console.error("Error createPassword:", err);

    if (err?.name === "ValidationError") {
      return res.status(400).json({
        ok: false,
        message: "Validación fallida",
        details: err.errors,
      });
    }

    if (err?.code === 11000) {
      return res.status(409).json({
        ok: false,
        message: "Duplicado detectado",
        details: err.keyValue,
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Error al crear contraseña y registrar usuario",
      error: err.message,
    });
  }
};


// Compatibilidad


exports.registerUser = exports.createPassword;