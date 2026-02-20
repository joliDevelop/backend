const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },

    purpose: {
      type: String,
      enum: ["register", "recovery", "delete"],
      required: true,
      index: true,
    },

    code: { type: String, required: true },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

emailVerificationSchema.index({ email: 1, purpose: 1 }, { unique: true });

emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmailVerification", emailVerificationSchema);