const User = require("../models/usuarios");
const bcrypt = require("bcryptjs");
exports.registerUser = async (req, res) => {
  try {
    const { nombre, apellidoP, apellidoM, edad, numesocial, email, password, lada, telefono } = req.body;

    // Tu schema exige edad y numesocial, así que también aquí
    if (!nombre || !apellidoP || !apellidoM || !edad || !numesocial || !email || !password || !lada || !telefono) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const cleanNombre = String(nombre).trim();
    const cleanApellidoP = String(apellidoP).trim();
    const cleanApellidoM = String(apellidoM).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanLada = String(lada).trim();
    const cleanTelefono = String(telefono).trim();
    const cleanNumesocial = String(numesocial).trim();
    const cleanEdad = Number(edad);

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) return res.status(400).json({ message: "Formato de correo inválido" });

    const ladaRegex = /^\+\d{1,4}$/;
    if (!ladaRegex.test(cleanLada)) return res.status(400).json({ message: "Formato de lada inválido (ej: +52)" });

    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(cleanTelefono)) return res.status(400).json({ message: "Teléfono inválido (10 dígitos)" });

    if (!Number.isFinite(cleanEdad) || cleanEdad < 18 || cleanEdad > 120) {
      return res.status(400).json({ message: "Edad inválida (18 a 120)" });
    }

    if (!/^\d{10}$/.test(cleanNumesocial)) {
      return res.status(400).json({ message: "El número de seguro social debe tener 10 dígitos" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Duplicados
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { telefono: cleanTelefono }, { numesocial: cleanNumesocial }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "Usuario ya registrado (correo/teléfono/NSS)" });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await User.create({
      nombre: cleanNombre,
      apellidop: cleanApellidoP, // ojo: schema usa apellidop
      apellidom: cleanApellidoM, // ojo: schema usa apellidom
      edad: cleanEdad,
      numesocial: cleanNumesocial,
      email: cleanEmail,
      password: hashedPassword,
      lada: cleanLada,
      telefono: cleanTelefono,
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Error registerUser:", err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicado: correo/teléfono/NSS ya existe" });
    }
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
};
