const mongoose = require("mongoose");

const peerAnswerSchema = new mongoose.Schema(
  {
    faqId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      default: "anonymous"
    },
    authorName: {
      type: String,
      default: "Community Member"
    },
    authorRole: {
      type: String,
      enum: ["student", "alumni", "moderator", "admin", "anonymous"],
      default: "student"
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },
    upvotes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

peerAnswerSchema.index({ faqId: 1, status: 1 });

module.exports = mongoose.model("PeerAnswer", peerAnswerSchema);
