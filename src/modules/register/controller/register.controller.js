const registerService = require("../service/register.service");

exports.preRegisterUser = async (req, res) => {
  try {
    const data = await registerService.preRegisterUser(req.body);
    return res.json(data);
  } catch (error) {
    return res.status(error.status || 500).json(error.response || {
      ok: false,
      message: error.message
    });
  }
};

exports.sendVerificationCode = async (req, res) => {
  try {
    const data = await registerService.sendVerificationCode(req.body);
    return res.json(data);
  } catch (error) {
    return res.status(error.status || 500).json(error.response || {
      ok: false,
      message: error.message
    });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const data = await registerService.verifyCode(req.body);
    return res.json(data);
  } catch (error) {
    return res.status(error.status || 500).json(error.response || {
      ok: false,
      message: error.message
    });
  }
};

exports.createPassword = async (req, res) => {
  try {
    const data = await registerService.createPassword(req.body);
    return res.status(201).json(data);
  } catch (error) {
    return res.status(error.status || 500).json(error.response || {
      ok: false,
      message: error.message
    });
  }
};