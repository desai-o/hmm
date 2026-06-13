const express = require("express");
const { getPersonalizedRecommendations } = require("../services/recommendationService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id || "anonymous";
    const limit = Number(req.query.limit || 10);

    const recommendations = await getPersonalizedRecommendations(userId, limit);

    return res.json({
      status: "success",
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch recommendations",
      details: error.message
    });
  }
});

module.exports = router;
