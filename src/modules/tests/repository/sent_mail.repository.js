const transporter = require("../../../config/mailer");

exports.sendMail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `"Joli Test" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
};