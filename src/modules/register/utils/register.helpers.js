exports.generateSixDigitCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

exports.buildExpiredProcessResponse = () => ({
  ok: false,
  message: "Proceso expirado"
});

// exports.buildUserResponse = (user) => ({
//   id: user._id,
//   email: user.email
// });