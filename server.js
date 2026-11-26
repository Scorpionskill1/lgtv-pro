const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const BASE = "https://rezka.ag";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const server = http.createServer(async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  const log = [];

  try {
    const r1 = await fetch(BASE + "/films/?filter=popular", {
      headers: { "User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9", "Referer": BASE + "/" }
    });
    const h1 = await r1.text();
    const initCookies = r1.headers.getSetCookie ? r1.headers.getSetCookie() : [r1.headers.get("set-cookie")].filter(Boolean);
    const initCookieHeader = initCookies.map(c => c.split(";")[0]).join("; ");
    log.push(`1. Первый запрос: HTTP ${r1.status}, initCookies: ${initCookieHeader}`);

    const m = h1.match(/<script[^>]*id="anubis_challenge"[^>]*>([\s\S]*?)<\/script>/i);
    if (!m) {
      log.push("Тег anubis_challenge не найден!");
      return res.end(log.join("\n\n"));
    }

    const parsed = JSON.parse(m[1]);
    const ch = parsed.challenge || parsed;
    const challengeStr = ch.randomData;
    const challengeId = ch.id;
    const difficulty = (parsed.rules && parsed.rules.difficulty) || ch.difficulty || 2;
    const prefix = "0".repeat(difficulty);

    const t0 = Date.now();
    let nonce = 0;
    let hash = "";
    while (nonce < 5000000) {
      hash = crypto.createHash("sha256").update(challengeStr + nonce).digest("hex");
      if (hash.startsWith(prefix)) break;
      nonce++;
    }
    const elapsed = Math.max(10, Date.now() - t0);
    log.push(`2. Решено за ${elapsed} мс! id=${challengeId}, nonce=${nonce}, hash=${hash}`);

    const passUrl = `${BASE}/.within.website/x/cmd/anubis/api/pass-challenge?id=${encodeURIComponent(challengeId)}&response=${hash}&nonce=${nonce}&redir=${encodeURIComponent(BASE + "/films/?filter=popular")}&elapsedTime=${elapsed}`;
    const r2 = await fetch(passUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": BASE + "/films/?filter=popular",
        ...(initCookieHeader ? { "Cookie": initCookieHeader } : {})
      },
      redirect: "manual"
    });
    const cookies = r2.headers.getSetCookie ? r2.headers.getSetCookie() : [r2.headers.get("set-cookie")].filter(Boolean);
    const authCookieHeader = cookies.map(c => c.split(";")[0]).join("; ");
    log.push(`3. Ответ pass-challenge: HTTP ${r2.status}, authCookies: ${authCookieHeader}`);

    if (authCookieHeader) {
      const r3 = await fetch(BASE + "/films/?filter=popular", {
        headers: { "User-Agent": UA, "Cookie": authCookieHeader, "Referer": BASE + "/" }
      });
      const h3 = await r3.text();
      const cards = (h3.match(/b-content__inline_item/g) || []).length;
      log.push(`4. ИТОГ С COOKIE: HTTP ${r3.status}, ${h3.length} байт, найдено фильмов: ${cards}`);
    }
  } catch (e) {
    log.push("ОШИБКА: " + e.stack);
  }

  res.end(log.join("\n\n"));
});

server.listen(PORT, "0.0.0.0", () => console.log("Listening on " + PORT));
