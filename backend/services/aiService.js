const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateSummary(question, answers) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const safeAnswers = Array.isArray(answers) ? answers : [];

  const prompt = `
Summarize this FAQ discussion for a student audience.

Question:
${question}

Answers:
${safeAnswers.join("\n\n")}

Rules:
- Do not invent facts.
- If answers disagree, mention uncertainty.
- Maximum 100 words.
- Use 3 concise bullet points.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text;
}

async function suggestDuplicateQuery(question, candidates) {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const prompt = `
You are checking whether a new FAQ question duplicates an existing FAQ.

New question:
${question}

Existing candidates:
${candidates
  .map((candidate, index) => `${index + 1}. ${candidate.question}`)
  .join("\n")}

Return JSON only:
{
  "isDuplicate": true/false,
  "matchedIndex": number_or_null,
  "reason": "short explanation"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      isDuplicate: false,
      matchedIndex: null,
      reason: "AI response could not be parsed"
    };
  }
}

module.exports = {
  generateSummary,
  suggestDuplicateQuery
};