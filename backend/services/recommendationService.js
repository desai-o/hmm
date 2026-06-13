const FAQ = require("../models/FAQ");
const Event = require("../models/Event");

async function getPersonalizedRecommendations(userId = "anonymous", limit = 10) {
  const recentEvents = await Event.find({
    userId
  })
    .sort({ createdAt: -1 })
    .limit(20);

  const searchTerms = recentEvents
    .filter((event) => event.type === "search_performed")
    .map((event) => event.targetId)
    .filter(Boolean)
    .join(" ");

  if (searchTerms.trim()) {
    return FAQ.find(
      {
        $text: {
          $search: searchTerms
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
      .limit(limit);
  }

  return FAQ.find()
    .sort({
      searchBoost: -1,
      createdAt: -1
    })
    .limit(limit);
}

module.exports = {
  getPersonalizedRecommendations
};
