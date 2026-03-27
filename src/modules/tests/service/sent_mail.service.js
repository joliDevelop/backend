const validator = require("../utils/sent_mail.validators");
const repository = require("../repository/sent_mail.repository");

exports.sendTestEmail = async (body) => {
  const {
    cleanTo,
    cleanSubject,
    cleanText,
    htmlContent
  } = validator.validateEmailData(body);

  const info = await repository.sendMail({
    to: cleanTo,
    subject: cleanSubject,
    text: cleanText,
    html: htmlContent
  });

  return {
    ok: true,
    message: "Correo de prueba enviado correctamente",
    result: {
      accepted: info.accepted,
      rejected: info.rejected,
      messageId: info.messageId
    }
  };
};