import { bot } from "../lib/bot.js";

async function readJson(req) {
  // Vercel ponekad ne popuni req.body u "Other" projektu
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;
  return JSON.parse(raw);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("webhook ok");
  }
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const update = await readJson(req);
    console.log("📩 update type:", update?.message?.text || update?.callback_query?.data || "no-text");

    await bot.handleUpdate(update);
  } catch (e) {
    console.error("webhook error:", e);
  }

  // Telegram očekuje brz 200
  return res.status(200).send("ok");
}
