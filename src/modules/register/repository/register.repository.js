const User = require("../../user/models/user.model");
const Role = require("../../user/models/userRole.model");
const PreRegister = require("../models/preRegister.model");
const VerificationCode = require("../models/verificationCode.model");

exports.validateUserDoesNotExist = async ({ email, telefono }) => {
  if (await User.findOne({ email: email }))
    throw { status: 409, response: { ok: false, message: "Email ya existe" } };

  if (await User.findOne({ telefono: telefono }))
    throw { status: 409, response: { ok: false, message: "Teléfono ya existe" } };
};

exports.upsertPreRegister = async (data, expiresAt) => {
  return PreRegister.findOneAndUpdate(
    { email: data.email },
    { ...data, expiresAt },
    { upsert: true }
  );
};

exports.getPreRegister = (email) => PreRegister.findOne({ email });

exports.deleteVerificationCodes = (email) =>
  VerificationCode.deleteMany({ email });

exports.createVerificationCode = (email, code, channel, expiresAt) =>
  VerificationCode.create({ email, code, channel, expiresAt });

exports.getVerification = (email, code) =>
  VerificationCode.findOne({ email, code, verified: false });

exports.markCodeAsVerified = async (verification) => {
  verification.verified = true;
  return verification.save();
};

exports.markPreRegisterAsVerified = (email) =>
  PreRegister.updateOne({ email }, { isCodeVerified: true });

exports.deleteVerification = (id) =>
  VerificationCode.deleteOne({ _id: id });

exports.getClienteRole = async () => {
  let role = await Role.findOne({ name: "cliente" });
  if (!role) role = await Role.create({ name: "cliente" });
  return role;
};

exports.createUser = (preRegister, password, role) =>
  User.create({
    ...preRegister.toObject(),
    password,
    role: role._id
  });

exports.cleanProcess = async (preId, email) => {
  await PreRegister.deleteOne({ _id: preId });
  await VerificationCode.deleteMany({ email });
};

exports.cleanExpiredProcess = async (preId, email) => {
  await PreRegister.deleteOne({ _id: preId });
  await VerificationCode.deleteMany({ email });
};