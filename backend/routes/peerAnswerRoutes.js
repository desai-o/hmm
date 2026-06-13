const express = require("express");
const PeerAnswer = require("../models/PeerAnswer");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { faqId, content } = req.body;

    if (!faqId || !content) {
      return res.status(400).json({
        error: "faqId and content are required"
      });
    }

    const peerAnswer = await PeerAnswer.create({
      faqId,
      content,
      userId: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      status: req.user.role === "alumni" ? "approved" : "pending"
    });

    return res.status(201).json({
      status: "success",
      data: peerAnswer
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create peer answer",
      details: error.message
    });
  }
});

router.get("/:faqId", async (req, res) => {
  try {
    const peerAnswers = await PeerAnswer.find({
      faqId: req.params.faqId,
      status: "approved"
    }).sort({
      upvotes: -1,
      createdAt: -1
    });

    return res.json({
      status: "success",
      data: peerAnswers
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch peer answers",
      details: error.message
    });
  }
});

router.patch("/:id/approve", requireAuth, requireRole("moderator", "admin"), async (req, res) => {
  try {
    const peerAnswer = await PeerAnswer.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved"
      },
      {
        new: true
      }
    );

    return res.json({
      status: "success",
      data: peerAnswer
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to approve peer answer",
      details: error.message
    });
  }
});

module.exports = router;
