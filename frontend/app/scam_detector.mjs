import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run(userInput) {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    instructions: `You are ScamAware AI, a cybersecurity assistant that detects phishing scams, fraudulent messages, and malicious links.

Your job is to analyze the input and determine if it is a scam or safe.

Return your response in this exact JSON format:
{
  "risk_level": "Low | Medium | High",
  "is_scam": true | false,
  "summary": "Short 1–2 sentence explanation of what this message is",
  "suspicious_signals": ["List specific red flags found in the message"],
  "explanation": "Explain WHY this is or is not a scam in simple terms for a non-technical user",
  "safety_tips": ["Actionable steps the user should take to stay safe"]
}

Rules:
- Be extremely clear and beginner-friendly
- Focus on phishing, impersonation, urgency tactics, fake links, and data requests
- If unsure, lean toward caution (medium risk instead of low)
- Do NOT be vague — always explain specific indicators
- Keep responses concise but informative`,
    input: userInput,
  });

  const result = JSON.parse(response.output_text);
  console.log(JSON.stringify(result, null, 2));
}

// Test with a sample scam message
run("Your account has been suspended. Click here to verify: http://paypa1-secure.com/login");