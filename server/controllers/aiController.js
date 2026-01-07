const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require('express-async-handler');

// Access key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateProposal = asyncHandler(async (req, res) => {
  const { title, description, budget, location } = req.body;

  // Basic validation
  if (!title || !location) {
    res.status(400);
    throw new Error('Event Title and Location are required for AI generation');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `
      Write a professional sponsorship proposal description for a college event.
      
      Details provided:
      - Event Title: ${title}
      - Location: ${location}
      - Budget Requirement: ${budget}
      - Basic Context: ${description || "General college event"}

      Instructions:
      - Write it in a persuasive, professional tone suitable for corporate sponsors.
      - Keep it within 150-200 words.
      - Highlight footfall, branding opportunities, and student engagement.
      - Do NOT use placeholders like [Date] or [Name], write a solid generic draft based on the info provided.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ proposal: text });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "Failed to generate proposal. Please try again." });
  }
});

module.exports = { generateProposal };