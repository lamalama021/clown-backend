import https from "https";

function send(text) {
  return new Promise((resolve, reject) => {
      const BOT_TOKEN = process.env.BOT_TOKEN;
          const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;
              if (!BOT_TOKEN || !GROUP_CHAT_ID) {
                    return reject(new Error("Missing BOT_TOKEN or GROUP_CHAT_ID"));
                        }

                            const body = JSON.stringify({ chat_id: GROUP_CHAT_ID, text });

                                const req = https.request(
                                      {
                                              method: "POST",
                                                      hostname: "api.telegram.org",
                                                              path: `/bot${BOT_TOKEN}/sendMessage`,
                                                                      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
                                                                            },
                                                                                  (res) => {
                                                                                          let data = "";
                                                                                                  res.on("data", (d) => (data += d));
                                                                                                          res.on("end", () => resolve({ status: res.statusCode, data }));
                                                                                                                }
                                                                                                                    );

                                                                                                                        req.on("error", reject);
                                                                                                                            req.write(body);
                                                                                                                                req.end();
                                                                                                                                  });
                                                                                                                                  }

                                                                                                                                  export default async function handler(req, res) {
                                                                                                                                    try {
                                                                                                                                        const out = await send("🤡 test notify");
                                                                                                                                            return res.status(200).json(out);
                                                                                                                                              } catch (e) {
                                                                                                                                                  return res.status(500).json({ error: e.message });
                                                                                                                                                    }
                                                                                                                                                    }