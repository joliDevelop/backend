const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepo = require("../repository/auth.repository");

exports.loginUser = async ({ email, password }) => {

    if (!email || !password) {
        throw {
            status: 400,
            message: "Email y contraseña son obligatorios"
        };
    }

    const errores = [];

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(cleanEmail)) {
        errores.push("Formato de correo inválido");
    }

    if (cleanPassword.length < 6) {
        errores.push("Contraseña muy corta");
    }

    if (errores.length > 0) {
        throw {
            status: 400,
            message: "Datos inválidos",
            errores
        };
    }

    // buscamos el user en la bd por email 
    const user = await authRepo.findByEmail(cleanEmail);

    if (!user) {
        throw { status: 404, message: "Correo no encontrado" };
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
        throw { status: 401, message: "Contraseña incorrecta" };
    }

    const payload = { userId: user._id };
    if (user.rol) payload.rol = user.rol;

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "10d",
    });

    return {
        user: {
            _id: user._id,
            nombre: user.nombre,
            apellidoP: user.apellidop,
            apellidoM: user.apellidom,
            edad: user.edad,
            email: user.email,
            lada: user.lada,
            telefono: user.telefono
        },
        token,
    };
};