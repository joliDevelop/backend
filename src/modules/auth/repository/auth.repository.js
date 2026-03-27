const User = require("../../../modules/user/models/user.model");

exports.findByEmail = (email) => {
  return User.findOne({ email });
};