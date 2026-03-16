const transporter = require("../config/mailer");

exports.sendTestEmail = async (req, res) => {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        ok: false,
        message: "Este endpoint no está disponible en producción",
      });
    }

    const { to, subject, text, html } = req.body;

    if (!to) {
      return res.status(400).json({
        ok: false,
        message: "El correo destino es obligatorio",
        field: "to",
      });
    }

    const cleanTo = String(to).trim().toLowerCase();
    const cleanSubject = String(subject || "Correo de prueba Joli").trim();
    const cleanText = String(
      text || "Este es un correo de prueba enviado desde el backend de Joli."
    ).trim();

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanTo)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de correo inválido",
        field: "to",
      });
    }

    const htmlContent =
      html ||
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Correo de prueba</h2>
          <p>Este es un correo de prueba enviado desde el backend de Joli.</p>
          <p><strong>Destino:</strong> ${cleanTo}</p>
        </div>
      `;

    const info = await transporter.sendMail({
      from: `"Joli Test" <${process.env.EMAIL_USER}>`,
      to: cleanTo,
      subject: cleanSubject,
      text: cleanText,
      html: htmlContent,
    });

    return res.status(200).json({
      ok: true,
      message: "Correo de prueba enviado correctamente",
      result: {
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        messageId: info.messageId,
      },
    });
  } catch (err) {
    console.error("Error sendTestEmail:", err);

    return res.status(500).json({
      ok: false,
      message: "Error al enviar correo de prueba",
      error: err.message,
    });
  }
};