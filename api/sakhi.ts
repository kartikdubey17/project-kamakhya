export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const body =
    typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const { message, phase } = body || {};

  return res.status(200).json({
    reply: `I hear you. The ${phase || "current"} phase can influence emotional rhythms. Tell me more.`
  });
}