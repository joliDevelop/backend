const User = require("../../user/models/user.model");
const Token = require("../model/recoverPassword.model");

exports.findUserByEmail = (email) =>
  User.findOne({ email });

exports.createToken = (email, token, expiresAt) =>
  Token.create({ email, token, expiresAt });

exports.findToken = (token) =>
  Token.findOne({ token });

exports.deleteToken = (id) =>
  Token.deleteOne({ _id: id });

exports.deleteTokensByEmail = (email) =>
  Token.deleteMany({ email });

exports.updatePassword = async (user, password) => {
  user.password = password;
  return user.save();
};