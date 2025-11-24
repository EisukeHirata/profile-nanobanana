
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGen() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("No API KEY");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  console.log("--- Testing gemini-2.5-flash-image ---");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    const prompt = "A drawing of a cat";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Candidates:", response.candidates?.length);
    if (response.candidates && response.candidates[0].content.parts) {
        response.candidates[0].content.parts.forEach((part, i) => {
            if (part.inlineData) console.log(`Part ${i}: inlineData (mime: ${part.inlineData.mimeType}, length: ${part.inlineData.data.length})`);
            if (part.text) console.log(`Part ${i}: text: ${part.text.substring(0, 50)}...`);
        });
    }
  } catch (e) {
    console.error("gemini-2.5-flash-image failed:", e.message);
  }

  console.log("\n--- Testing gemini-2.0-flash (with base64 prompt) ---");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Generate a drawing of a cat.
      IMPORTANT: You are an image generation API. 
      You MUST return the generated image as a Base64 encoded string starting with "data:image/jpeg;base64,".
      Do not wrap it in markdown. Do not add conversational text. Just return the Base64 string.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Response text length:", text.length);
    console.log("Response start:", text.substring(0, 100));
    if (text.includes("data:image")) {
        console.log("Contains data:image tag");
    } else {
        console.log("Does NOT contain data:image tag");
    }
  } catch (e) {
    console.error("gemini-2.0-flash failed:", e.message);
  }
}

testGen();
