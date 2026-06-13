const express = require("express");
const router = express.Router();

const { generateSummary, suggestDuplicateQuery } = require("../services/aiService");
const FAQ = require("../models/FAQ");
const { requireAuth } = require("../middleware/auth");

router.post("/summary", async (req, res) => {
  try {
    const { question, answers } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const summary = await generateSummary(question, answers || []);

    return res.json({
      status: "success",
      data: {
        summary
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Summary generation failed",
      details: error.message
    });
  }
});

router.post("/duplicates", requireAuth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const candidates = await FAQ.find(
      {
        $text: {
          $search: question
        }
      },
      {
        score: {
          $meta: "textScore"
        }
      }
    )
      .sort({
        score: {
          $meta: "textScore"
        }
      })
      .limit(5);

    const result = await suggestDuplicateQuery(question, candidates);

    return res.json({
      status: "success",
      data: {
        candidates,
        aiSuggestion: result
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Duplicate check failed",
      details: error.message
    });
  }
});

module.exports = router;