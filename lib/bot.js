import { Telegraf } from "telegraf";
import { pool } from "./db.js";

export const bot = new Telegraf(process.env.BOT_TOKEN);

// /start: upiši user-a u bazu + pošalji meni
bot.start(async (ctx) => {
  const u = ctx.from;

  await pool.query(
    `insert into users (telegram_id, username, first_name, updated_at)
     values ($1,$2,$3,now())
     on conflict (telegram_id) do update
       set username=excluded.username,
           first_name=excluded.first_name,
           updated_at=now()`,
    [u.id, u.username || null, u.first_name || null]
  );

  await ctx.reply("🤡 Klovn Kafana bot radi preko webhook-a!", {
    reply_markup: {
      keyboard: [
        ["🎚️ Level +1", "🎚️ Level -1"],
        ["📍 Set lokacija"],
        ["🧾 Moj status"]
      ],
      resize_keyboard: true,
    },
  });
});

bot.hears("🎚️ Level +1", async (ctx) => {
  const id = ctx.from.id;
  const r = await pool.query(
    `update users
     set level = coalesce(level,0) + 1, updated_at = now()
     where telegram_id = $1
     returning level`,
    [id]
  );
  await ctx.reply(`✅ Level: ${r.rows[0]?.level ?? "?"}`);
});

bot.hears("🎚️ Level -1", async (ctx) => {
  const id = ctx.from.id;
  const r = await pool.query(
    `update users
     set level = greatest(coalesce(level,0) - 1, 0), updated_at = now()
     where telegram_id = $1
     returning level`,
    [id]
  );
  await ctx.reply(`✅ Level: ${r.rows[0]?.level ?? "?"}`);
});

const pendingLoc = new Set();

bot.hears("📍 Set lokacija", async (ctx) => {
  pendingLoc.add(ctx.from.id);
  await ctx.reply("Upiši lokaciju (npr. 'Kafana Kod Mike'):");
});

bot.hears("🧾 Moj status", async (ctx) => {
  const id = ctx.from.id;
  const r = await pool.query(
    `select level, location, updated_at from users where telegram_id=$1`,
    [id]
  );
  const row = r.rows[0];
  await ctx.reply(
    row
      ? `🤡 Level: ${row.level}\n📍 Lokacija: ${row.location || "—"}\n🕒 Update: ${row.updated_at}`
      : "Nema te u bazi još, pošalji /start."
  );
});

bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  if (!pendingLoc.has(id)) return;

  pendingLoc.delete(id);
  const loc = ctx.message.text.trim();

  await pool.query(
    `update users set location=$1, updated_at=now() where telegram_id=$2`,
    [loc, id]
  );

  await ctx.reply(`📍 Lokacija postavljena: ${loc}`);
});
