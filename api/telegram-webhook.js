import { bot } from "../lib/bot.js";

export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).send("webhook ok");
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  console.log("📩 update received");

  try {
    await bot.handleUpdate(req.body, res);
  } catch (e) {
    console.error("webhook error:", e);
    res.status(200).send("ok");
  }
}