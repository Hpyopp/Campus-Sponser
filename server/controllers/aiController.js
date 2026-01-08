const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require('express-async-handler');

// 👇 DIRECT KEY (Taaki .env ka lafda khatam ho)
// Note: Baad mein jab chal jaye, toh isse wapas process.env.GEMINI_API_KEY kar dena.
const API_KEY = "AIzaSyDq_7iXV6snRh9cc-jJgpzTDyV4WlTIPpI";

const genAI = new GoogleGenerativeAI(API_KEY);

const generateProposal = asyncHandler(async (req, res) => {
  const { title, description, budget, location } = req.body;

  // 1. Validation
  if (!title || !location) {
    res.status(400);
    throw new Error('Event Title and Location are required');
  }

  try {
    console.log("🤖 AI Request Started for:", title);
    
    // 👇 MODEL: 'gemini-1.5-flash' (Latest & Fastest)
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

    console.log("✅ AI Success!");
    res.json({ proposal: text });

  } catch (error) {
    // Detailed Error Logging
    console.error("❌ AI FAILED:", error);
    
    // Agar Google 404 de raha hai, toh hum fallback message bhejenge
    if (error.message.includes("404")) {
        res.status(500).json({ message: "Error: Model Not Found. Check Region/Key." });
    } else {
        res.status(500).json({ message: "AI Failed. Try again later." });
    }
  }
});

module.exports = { generateProposal };