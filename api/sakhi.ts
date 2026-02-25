import OpenAI from "openai";

console.log("KEY EXISTS:", !!process.env.OPENAI_API_KEY);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `
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
`,
        },

        ...history.map((m: any) => ({
          role: m.role === "sakhi" ? "assistant" : "user",
          content: m.text,
        })),

        {
          role: "user",
          content: `
Cycle phase: ${phase}
Mood today: ${context?.mood ?? "unknown"}
Latest reflection: ${context?.reflection ?? "none"}
Grounding attempted: ${context?.breathingDone ? "yes" : "no"}

User message: ${message}
`,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(200).json({
      reply:
        "I'm here with you. Sometimes my words take a quiet moment to arrive — tell me again.",
    });
  }
}