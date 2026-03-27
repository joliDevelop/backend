// Maneja el envío y verificación de códigos SMS usando Twilio Verify
// Permite autenticar usuarios mediante código enviado al teléfono
// install 
// npm install twilio

const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

exports.sendCode = async (req, res) => {

  const { phone } = req.body;

  try {
    const verification = await client.verify.v2
      .services("VA19fb04949d553c2d684cd8e0d87b70fa")
      .verifications.create({
        to: phone,
        channel: "sms"
      });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json(error);
  }

};

exports.verifyCode = async (req, res) => {

  const { phone, code } = req.body;

  const verification_check = await client.verify.v2
    .services("VA19fb04949d553c2d684cd8e0d87b70fa")
    .verificationChecks.create({
      to: phone,
      code: code
    });

  if (verification_check.status === "approved") {
    res.json({ verified: true });
  } else {
    res.json({ verified: false });
  }

};