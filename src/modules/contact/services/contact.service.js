const contactRepo = require("../repository/contact.repository");
const mailer = require("../../../config/mailer");

exports.createContact = async ({ nombre_completo, telefono, email, edad, comentarios }) => {
  if (!nombre_completo) throw { status: 400, message: "El nombre completo es obligatorio" };
  if (String(nombre_completo).trim().length > 50) {
    throw { status: 400, message: "El nombre no puede superar los 50 caracteres" };
  }
  if (!telefono && !email) {
    throw { status: 400, message: "Debes proporcionar al menos un teléfono o correo" };
  }
  if (!edad) throw { status: 400, message: "La edad es obligatoria" };
  if (isNaN(edad) || edad < 1 || edad > 120) {
    throw { status: 400, message: "La edad no es válida" };
  }

  if (email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(String(email).trim().toLowerCase())) {
      throw { status: 400, message: "Formato de correo inválido" };
    }
  }

  const contactoGuardado = await contactRepo.createContact({
    nombre_completo: String(nombre_completo).trim(),
    telefono: telefono || null,
    email: email ? String(email).trim().toLowerCase() : null,
    edad: Number(edad),
    comentarios: comentarios || null,
  });

  try {
    await mailer.sendMail({
      from: `"Joli Backend" <${process.env.EMAIL_USER}>`,
      to: "sistemas@joli.com.mx",
      subject: `${contactoGuardado.nombre_completo} solicita información de Joli`,
     html: `
  <div style="margin:0; padding:40px 20px; background-color:#f1f5f9; font-family:Arial, Helvetica, sans-serif; color:#334155;">
    <div style="max-width:760px; margin:0 auto; background-color:#ffffff; border-radius:24px; padding:56px 60px; box-sizing:border-box;">

      <h1 style="margin:0 0 24px; font-size:34px; line-height:1.2; text-align:center; color:#1e293b; font-weight:700;">
        Nueva consulta recibida
      </h1>

      <p style="margin:0 0 28px; font-size:16px; line-height:1.7; color:#475569;">
        Se recibió un nuevo mensaje desde el formulario de contacto de <strong>Joli</strong>.
      </p>

      <div style="margin:0 0 32px; padding:22px 24px; background-color:#f8fafc; border-radius:18px; border:1px solid #e2e8f0;">
        <p style="margin:0 0 10px; font-size:14px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:.4px;">
          Mensaje
        </p>
        <p style="margin:0; font-size:20px; line-height:1.7; color:#1e293b;">
          ${contactoGuardado.comentarios || "Sin comentario proporcionado"}
        </p>
      </div>

      <div style="margin:0 0 32px; padding:24px; background-color:#ecfeff; border-radius:18px; text-align:center;">
        <p style="margin:0 0 8px; font-size:14px; color:#475569; font-weight:600;">
          Datos para seguimiento
        </p>
        <p style="margin:0; font-size:18px; line-height:1.8; color:#0f172a;">
          <strong>${contactoGuardado.nombre_completo}</strong><br>
          ${
            contactoGuardado.email
              ? `<a href="mailto:${contactoGuardado.email}" style="color:#0f172a; text-decoration:none;">${contactoGuardado.email}</a>`
              : ""
          }
          ${
            contactoGuardado.email && contactoGuardado.telefono
              ? `<br>`
              : ""
          }
          ${
            contactoGuardado.telefono
              ? `<span style="color:#0f172a;">${contactoGuardado.telefono}</span>`
              : ""
          }
          ${
            !contactoGuardado.email && !contactoGuardado.telefono
              ? `<span style="color:#64748b;">Sin medio de contacto disponible</span>`
              : ""
          }
        </p>
      </div>

      <hr style="border:none; border-top:1px solid #e2e8f0; margin:32px 0;">

      <p style="margin:0 0 10px; text-align:center; font-size:15px; line-height:1.7; color:#64748b;">
        Este mensaje fue generado automáticamente desde el formulario de contacto de Joli.
      </p>

      <p style="margin:0; text-align:center; font-size:14px; color:#94a3b8;">
        © 2026 Joli. Todos los derechos reservados.
      </p>
    </div>
  </div>
`
    });
  } catch (error) {
    console.error("Error al enviar correo de contacto:", error.message);
  }

  return contactoGuardado;
};

exports.getAllContacts = async () => {
  return await contactRepo.getAllContacts();
};

exports.getContactById = async (id) => {
  const contact = await contactRepo.getContactById(id);
  if (!contact) throw { status: 404, message: "Contacto no encontrado" };
  return contact;
};