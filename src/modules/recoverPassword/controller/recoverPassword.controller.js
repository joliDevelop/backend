const service = require("../service/recoverPassword.service");

exports.forgotPassword = async (req, res) => {
  try {
    const data = await service.forgotPassword(req.body);
    return res.json(data);
  } catch (error) {
    return res.status(error.status || 500).json(error.response || {
      ok: false,
      message: error.message
    });
  }
};

exports.validateResetToken = async (req, res) => {
  try {
    const data = await service.validateResetToken(req.params);
    return res.json(data);
  } catch (error) {
    return res.status(error.status || 500).json(error.response);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const data = await service.resetPassword(req.body);
    return res.json(data);
  } catch (error) {
    return res.status(error.status || 500).json(error.response);
  }
};