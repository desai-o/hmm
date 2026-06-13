const mongoose = require("mongoose");

const userQuerySchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending"
    },
    source: {
      type: String,
      default: "frontend"
    },
    category: {
      type: String,
      default: "General",
      trim: true,
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    promoted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

userQuerySchema.index(
  {
    question: "text",
    answer: "text",
    description: "text",
    category: "text",
    tags: "text"
  },
  {
    weights: {
      question: 10,
      category: 6,
      tags: 5,
      description: 3,
      answer: 2
    }
  }
);

userQuerySchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("UserQuery", userQuerySchema);
