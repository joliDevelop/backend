const mailService = require("../service/sent_mail.service");

exports.sendTestEmail = async (req, res) => {
  try {
    const data = await mailService.sendTestEmail(req.body);
    return res.json(data);
  } catch (error) {
    return res.status(error.status || 500).json(error.response || {
      ok: false,
      message: error.message
    });
  }
};