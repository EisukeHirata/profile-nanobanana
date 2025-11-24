
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("No API KEY");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Note: The SDK might not expose listModels directly on the client instance in all versions,
    // but usually it's available via the model manager or similar. 
    // Actually, for the JS SDK, we might need to just try to generate with a few common names 
    // or check if there is a list method. 
    // The GoogleGenerativeAI class doesn't have listModels. 
    // We might need to use the REST API directly for listing if the SDK doesn't support it easily.
    
    console.log("Attempting to list models via REST API...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
        console.log("Available Models:");
        data.models.forEach(m => {
            if (m.name.includes("gemini")) {
                console.log(`- ${m.name} (Supported generation methods: ${m.supportedGenerationMethods})`);
            }
        });
    } else {
        console.log("Could not list models:", data);
    }

  } catch (e) {
    console.error("Failed to list models:", e);
  }
}

listModels();
