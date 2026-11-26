const http = require("http");

const PORT = process.env.PORT || 3000;
const MIRRORS = ["https://rezka.ag", "https://hdrezka.me", "https://rezka-ua.tv", "https://hdrezka.ag"];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  let diag = [];

  for (const base of MIRRORS) {
    try {
      const r = await fetch(base + "/films/?filter=popular", {
        headers: {
          "User-Agent": UA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
          "Referer": base + "/"
        }
      });
      const t = await r.text();
      diag.push(`=== ${base} (HTTP ${r.status}, ${t.length} байт) ===\n${t.slice(0, 700).replace(/\s+/g, " ")}`);
    } catch (e) {
      diag.push(`=== ${base} ОШИБКА: ${e.message} ===`);
    }
  }

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(diag.join("\n\n"));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("LG TV Gateway listening on port " + PORT);
});
