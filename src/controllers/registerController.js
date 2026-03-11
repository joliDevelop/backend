const User = require("../models/usuarios");
const Role = require("../models/role");
const bcrypt = require("bcryptjs");
const VerificationCode = require("../models/verificationCode");
const transporter = require("../config/mailer");
const jwt = require("jsonwebtoken");

exports.preRegisterUser = async (req, res) => {
  try {
    const {
      nombre,
      apellidoP,
      apellidoM,
      edad,
      email,
      lada,
      telefono,
    } = req.body;

    if (
      !nombre ||
      !apellidoP ||
      !apellidoM ||
      edad === undefined ||
      !email ||
      !lada ||
      !telefono
    ) {
      return res.status(400).json({
        ok: false,
        message: "Todos los campos son obligatorios",
      });
    }

    const cleanNombre = String(nombre).trim();
    const cleanApellidoP = String(apellidoP).trim();
    const cleanApellidoM = String(apellidoM).trim();
    const cleanEdad = Number(edad);
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanLada = String(lada).trim();
    const cleanTelefono = String(telefono).trim();

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de correo inválido",
        field: "email",
      });
    }

    const ladaRegex = /^\+\d{1,4}$/;
    if (!ladaRegex.test(cleanLada)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de lada inválido (ej: +52)",
        field: "lada",
      });
    }

    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(cleanTelefono)) {
      return res.status(400).json({
        ok: false,
        message: "Teléfono inválido (10 dígitos)",
        field: "telefono",
      });
    }

    if (!Number.isFinite(cleanEdad) || cleanEdad < 18 || cleanEdad > 120) {
      return res.status(400).json({
        ok: false,
        message: "Edad inválida (18 a 120)",
        field: "edad",
      });
    }

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

    return res.status(200).json({
      ok: true,
      message: "Datos correctos para validar identidad.",
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

    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`]).{8,}$/;

    if (!passwordRegex.test(cleanPassword)) {
      return res.status(400).json({
        ok: false,
        message:
          "La contraseña debe tener mínimo 8 caracteres, al menos un número y un carácter especial",
        field: "password",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        ok: false,
        message: "Primero debes verificar tu correo",
      });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    user.password = hashedPassword;
    user.registrationCompleted = true;
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Contraseña creada correctamente. Registro completado.",
    });
  } catch (err) {
    console.error("Error createPassword:", err);
    return res.status(500).json({
      ok: false,
      message: "Error al crear contraseña",
      error: err.message,
    });
  }
};

function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El correo es obligatorio",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        ok: false,
        message: "El correo ya fue verificado",
      });
    }

    const code = generateSixDigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.deleteMany({ email: cleanEmail });

    await VerificationCode.create({
      email: cleanEmail,
      telefono: user.telefono,
      code,
      expiresAt,
    });

    const info = await transporter.sendMail({
      from: `"Joli" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Código de verificación",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Verificación de correo</h2>
          <p>Hola, este es tu código de verificación:</p>
          <h1 style="letter-spacing: 4px;">${code}</h1>
          <p>Este código expira en 10 minutos.</p>
        </div>
      `,
    });

    console.log("Correo enviado:", info.response);

    return res.status(200).json({
      ok: true,
      message: "Código de verificación enviado correctamente",
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

exports.verifyEmailCode = async (req, res) => {
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
    });

    if (!verification) {
      return res.status(400).json({
        ok: false,
        message: "Código inválido",
      });
    }

    if (verification.expiresAt < new Date()) {
      await VerificationCode.deleteOne({ _id: verification._id });

      return res.status(400).json({
        ok: false,
        message: "El código expiró",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    await VerificationCode.deleteOne({ _id: verification._id });

    return res.status(200).json({
      ok: true,
      message: "Correo verificado correctamente",
      nextStep: "createPassword",
    });
  } catch (err) {
    console.error("Error verifyEmailCode:", err);
    return res.status(500).json({
      ok: false,
      message: "Error al verificar el código",
      error: err.message,
    });
  }
};

 
exports.registerUser = async (req, res) => {
  try {
    const {
      nombre,
      apellidoP,
      apellidoM,
      edad,
      email,
      password,
      confirmPassword,
      lada,
      telefono,
    } = req.body;

    // 1) PRIMERO validar email
    if (!email) {
      return res.status(400).json({ message: "El correo es obligatorio" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Formato de correo inválido" });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // 🔹 2) Validar demás campos obligatorios
    if (
      !nombre ||
      !apellidoP ||
      !apellidoM ||
      edad === undefined ||
      !password ||
      !confirmPassword ||
      !lada ||
      !telefono
    ) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Confirmación de contraseña
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`]).{8,}$/;

if (!passwordRegex.test(String(password))) {
  return res.status(400).json({
    message:
      "La contraseña debe tener mínimo 8 caracteres, al menos un número y un carácter especial",
  });
}



    const cleanNombre = String(nombre).trim();
    const cleanApellidoP = String(apellidoP).trim();
    const cleanApellidoM = String(apellidoM).trim();
    const cleanLada = String(lada).trim();
    const cleanTelefono = String(telefono).trim();
    const cleanEdad = Number(edad);

    const ladaRegex = /^\+\d{1,4}$/;
    if (!ladaRegex.test(cleanLada)) {
      return res.status(400).json({ message: "Formato de lada inválido (ej: +52)" });
    }

    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(cleanTelefono)) {
      return res.status(400).json({ message: "Teléfono inválido (10 dígitos)" });
    }

    if (!Number.isFinite(cleanEdad) || cleanEdad < 18 || cleanEdad > 120) {
      return res.status(400).json({ message: "Edad inválida (18 a 120)" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validar duplicado de teléfono aparte (ya validamos email arriba)
    const existingPhone = await User.findOne({ telefono: cleanTelefono });
    if (existingPhone) {
      return res.status(409).json({ message: "El teléfono ya está registrado" });
    }

    // 🔥 Rol automático: cliente
    let clienteRole = await Role.findOne({ name: "cliente" }).select("_id");
    if (!clienteRole) {
      clienteRole = await Role.create({ name: "cliente" });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await User.create({
      nombre: cleanNombre,
      apellidop: cleanApellidoP,
      apellidom: cleanApellidoM,
      edad: cleanEdad,
      email: cleanEmail,
      password: hashedPassword,
      lada: cleanLada,
      telefono: cleanTelefono,
      role: clienteRole._id,
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: newUser,

    });

  } catch (err) {
    console.error("Error registerUser:", err);

    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: "Validación fallida", details: err.errors });
    }

    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicado detectado", details: err.keyValue });
    }

    return res.status(500).json({ message: "Error al registrar usuario", error: err.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errores = [];

    if (!email) errores.push("El correo es obligatorio");
    if (!password) errores.push("La contraseña es obligatoria");

    if (errores.length > 0) {
      return res.status(400).json({
        message: "Datos inválidos",
        errores
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Formato de correo inválido",
        campo: "email"
      });
    }

    // Busca usuario por email
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: "Correo no encontrado",
        campo: "email"
      });
    }

    // Comparación con bcrypt
    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Contraseña incorrecta",
        campo: "password"
      });
    }

    // Token
    const payload = { userId: user._id };
    if (user.rol) payload.rol = user.rol;

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "365d" });

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        _id: user._id,
        nombre: user.nombre,
        apellidoP: user.apellidop,
        apellidoM: user.apellidom,
        edad: user.edad,
        numesocial: user.numesocial,
        email: user.email,
        lada: user.lada,
        telefono: user.telefono,
        ...(user.rol ? { rol: user.rol } : {}),
      },
      token,
    });
  } catch (err) {
    console.error("Error loginUser:", err);
    return res.status(500).json({ message: "Error interno al iniciar sesión" });
  }
};
