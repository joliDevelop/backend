const User = require("../models/usuarios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Role = require("../models/role");

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
    if (String(password) !== String(confirmPassword)) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
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
