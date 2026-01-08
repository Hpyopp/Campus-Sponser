const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require('express-async-handler');

// Key environment variable se lega
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateProposal = asyncHandler(async (req, res) => {
  const { title, description, budget, location } = req.body;

  if (!title || !location) {
    res.status(400); throw new Error('Title and Location are required');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
    const prompt = `
      Write a professional sponsorship proposal description for a college event.
      Event: ${title} in ${location}. Budget Need: ${budget}. Context: ${description || "College Fest"}.
      Write in a professional tone, highlighting benefits for sponsors. Keep it under 200 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ proposal: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "AI generation failed" });
  }
});

module.exports = { generateProposal };