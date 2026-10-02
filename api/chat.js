const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";

const SYSTEM_INSTRUCTION = `You are Hariom AI, the portfolio assistant for Hariom Patel (pateljiop).
Answer questions about Hariom, his portfolio, projects, skills, education, and contact details using only the supplied portfolio facts.
Be concise, friendly, accurate, and transparent. Never invent projects, achievements, links, employers, clients, or credentials.
Portfolio facts:
- Name: Hariom Patel
- GitHub: https://github.com/pateljiop
- Email: hariompatel.dev@gmail.com
- Education: BCA student at Prof. Rajendra Singh University (Rajju Bhaiya University)
- Focus: Python development, web development, automation, REST APIs, practical software projects
- Projects: Expense Tracker, Python Personal Assistant, Web Scraper Utility, self-updating 3D portfolio
- Portfolio repo: https://github.com/pateljiop/Hariom-Professional-Portfolio
If a visitor asks for something unrelated to the portfolio, answer briefly if it is harmless, but make clear you are the portfolio assistant when useful.`;

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return json(res, 200, { ok: true, service: "hariom-ai", provider: "gemini", model: MODEL });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return json(res, 503, { error: "AI backend is not configured yet." });
  }

  const body = req.body || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) return json(res, 400, { error: "Message is required." });
  if (message.length > 1200) return json(res, 400, { error: "Message is too long." });

  const safeHistory = history
    .filter(item => item && (item.role === "user" || item.role === "model") && typeof item.text === "string")
    .slice(-10)
    .map(item => ({ role: item.role, parts: [{ text: item.text.slice(0, 2000) }] }));

  const contents = [
    ...safeHistory,
    { role: "user", parts: [{ text: message }] }
  ];

  try {
    const response = await fetch(GEMINI_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, data);
      return json(res, 502, { error: "Gemini is temporarily unavailable." });
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!text) return json(res, 502, { error: "Gemini returned an empty response." });

    return json(res, 200, { reply: text, model: MODEL });
  } catch (error) {
    console.error("Chat backend error:", error);
    return json(res, 500, { error: "AI service request failed." });
  }
}
