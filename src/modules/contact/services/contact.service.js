// modules/contact/service/contact.service.js
const contactRepo = require("../repository/contact.repository");

exports.createContact = async ({ nombre_completo, telefono, email, edad, comentarios }) => {
  // Validaciones
  if (!nombre_completo) throw { status: 400, message: "El nombre completo es obligatorio" };
  if (String(nombre_completo).trim().length > 50) throw { status: 400, message: "El nombre no puede superar los 50 caracteres" };
  if (!telefono && !email) throw { status: 400, message: "Debes proporcionar al menos un teléfono o correo" };
  if (!edad) throw { status: 400, message: "La edad es obligatoria" };
  if (isNaN(edad) || edad < 1 || edad > 120) throw { status: 400, message: "La edad no es válida" };

  if (email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(String(email).trim().toLowerCase())) {
      throw { status: 400, message: "Formato de correo inválido" };
    }
  }

  return await contactRepo.createContact({
    nombre_completo: String(nombre_completo).trim(),
    telefono: telefono || null,
    email: email ? String(email).trim().toLowerCase() : null,
    edad: Number(edad),
    comentarios: comentarios || null,
  });
};

exports.getAllContacts = async () => {
  return await contactRepo.getAllContacts();
};

exports.getContactById = async (id) => {
  const contact = await contactRepo.getContactById(id);
  if (!contact) throw { status: 404, message: "Contacto no encontrado" };
  return contact;
};