const User = require("../models/usuarios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { nombre, apellidoP, apellidoM, edad, email, password, confirmPassword, lada, telefono } = req.body;

    // Ya NO pedimos numesocial, pero sí confirmPassword
    if (!nombre || !apellidoP || !apellidoM || !edad || !email || !password || !confirmPassword || !lada || !telefono) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Confirmación de contraseña
    if (String(password) !== String(confirmPassword)) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    const cleanNombre = String(nombre).trim();
    const cleanApellidoP = String(apellidoP).trim();
    const cleanApellidoM = String(apellidoM).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanLada = String(lada).trim();
    const cleanTelefono = String(telefono).trim();
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

    if (String(password).length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Duplicados (ya no incluimos numesocial)
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { telefono: cleanTelefono }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "Usuario ya registrado (correo/teléfono)" });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await User.create({
      nombre: cleanNombre,
      apellidop: cleanApellidoP, // ojo: schema usa apellidop
      apellidom: cleanApellidoM, // ojo: schema usa apellidom
      edad: cleanEdad,
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
      return res.status(409).json({ message: "Duplicado: correo/teléfono ya existe" });
    }
    return res.status(500).json({ message: "Error al registrar usuario" });
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
        message: "Usuario no encontrado",
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

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

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
