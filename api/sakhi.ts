export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { message, phase } = req.body

  return res.status(200).json({
    reply: `I hear you. Moving through the ${phase} phase can shape how emotions feel. Tell me more.`
  })
}