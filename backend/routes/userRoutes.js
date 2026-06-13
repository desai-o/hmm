const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ reputation: -1, answersCount: -1 })
      .limit(20)
      .select("name email role reputation questionsCount answersCount badges cohort");

    return res.json({
      status: "success",
      data: users
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch leaderboard",
      details: error.message
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    if (!req.user || req.user.id === "anonymous") {
      return res.status(401).json({
        error: "Authentication required"
      });
    }

    const user = await User.findById(req.user.id).select("-passwordHash");

    return res.json({
      status: "success",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user",
      details: error.message
    });
  }
});

module.exports = router;
