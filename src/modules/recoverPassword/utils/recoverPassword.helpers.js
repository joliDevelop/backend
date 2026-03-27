exports.buildResetLink = (token) => {
  return `${process.env.FRONTEND_URL}/reset/password?token=${token}`;
};