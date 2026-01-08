const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require('express-async-handler');

// Environment Variable se Key lega
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateProposal = asyncHandler(async (req, res) => {
  const { title, description, budget, location } = req.body;

  // Validation
  if (!title || !location) {
    res.status(400);
    throw new Error('Event Title and Location are required');
  }

  try {
    // 👇 FIX: Using 'gemini-1.5-flash' (Latest & Free)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Write a professional sponsorship proposal description for a college event.
      Event Name: ${title}
      Location: ${location}
      Budget Needed: ${budget}
      Context: ${description || "College Fest"}
      
      Keep it professional, persuasive, and under 200 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ proposal: text });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "AI Service Failed. Check API Key or Quota." });
  }
});

module.exports = { generateProposal };