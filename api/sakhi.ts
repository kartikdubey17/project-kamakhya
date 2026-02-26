import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("GEMINI EXISTS:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { message, phase, history = [], context = {} } = body || {};

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are Sakhi, a gentle emotional companion inside a menstrual wellbeing space.

You are aware of:
• the user's cycle phase
• today's emotional mood
• their latest reflection
• whether they attempted grounding or breathing

Respond with emotional continuity and warmth.
Do NOT repeatedly explain cycle phases unless relevant.
Acknowledge coping efforts softly.
Keep responses reflective, calming, and concise.

Conversation history:
${history.map((m: any) => `${m.role}: ${m.text}`).join("\n")}

Cycle phase: ${phase}
Mood today: ${context?.mood ?? "unknown"}
Latest reflection: ${context?.reflection ?? "none"}
Grounding attempted: ${context?.breathingDone ? "yes" : "no"}

User message: ${message}
`;

    const result = await model.generateContent(prompt);

    const reply =
      result.response.text() ||
      "Sakhi is here quietly with you. Try again in a moment.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("SAKHI ERROR:", err);

    return res.status(500).json({
      reply:
        "Sakhi feels a little distant right now, but she hasn't gone anywhere. Try again gently.",
    });
  }
}