const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const MIRRORS = ["https://rezka.ag", "https://hdrezka.me", "https://rezka-ua.tv"];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const cookieJar = {};

function solveAnubis(html) {
  const m = html.match(/id="anubis_challenge"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  const challenge = JSON.parse(m[1]);
  const rules = challenge.rules || {};
  const difficulty = rules.difficulty || 4;
  const prefix = "0".repeat(difficulty);
  const baseData = challenge.challenge;

  let nonce = 0;
  const t0 = Date.now();
  while (true) {
    const hash = crypto.createHash("sha256").update(baseData + nonce).digest("hex");
    if (hash.startsWith(prefix)) {
      return {
        id: challenge.id,
        response: hash,
        nonce,
        elapsedTime: Date.now() - t0
      };
    }
    nonce++;
    if (nonce > 5000000) return null;
  }
}

async function rezkaRequest(path, opts = {}) {
  for (const base of MIRRORS) {
    const target = path.startsWith("http") ? path : base + path;
    const headers = {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
      "Referer": base + "/",
      ...(cookieJar[base] ? { Cookie: cookieJar[base] } : {}),
      ...(opts.headers || {})
    };

    try {
      let res = await fetch(target, { ...opts, headers, redirect: "follow" });
      let text = await res.text();

      if (text.includes("anubis_challenge") || text.includes("Проверяем, что вы не бот")) {
        const solved = solveAnubis(text);
        if (solved) {
          const passUrl = `${base}/.within.website/x/cmd/anubis/api/pass-challenge?id=${encodeURIComponent(solved.id)}&response=${solved.response}&nonce=${solved.nonce}&redir=${encodeURIComponent(target)}&elapsedTime=${solved.elapsedTime}`;
          const passRes = await fetch(passUrl, { headers, redirect: "manual" });
          const rawCookies = passRes.headers.getSetCookie ? passRes.headers.getSetCookie() : [];
          if (rawCookies.length > 0) {
            cookieJar[base] = rawCookies.map((c) => c.split(";")[0]).join("; ");
            headers.Cookie = cookieJar[base];
            res = await fetch(target, { ...opts, headers, redirect: "follow" });
            text = await res.text();
          }
        }
      }

      if (res.ok && !text.includes("Проверяем, что вы не бот")) {
        return { text, base, ok: true };
      }
    } catch (e) {}
  }
  return { text: "", base: MIRRORS[0], ok: false };
}

function decodeRezkaStreams(raw) {
  if (!raw) return "";
  const clean = raw.replace(/\\\//g, "/");
  if (!clean.startsWith("#")) return clean;

  const trash = ["@", "#", "!", "^", "$"];
  const codes = [];
  const gen = (k, p = "") => {
    if (k === 0) { codes.push(Buffer.from(p).toString("base64")); return; }
    for (const ch of trash) gen(k - 1, p + ch);
  };
  gen(2);
  gen(3);

  let data = clean.substring(2).replace(/\/\/_\/\//g, "");
  for (const c of codes) data = data.split(c).join("");

  try {
    return Buffer.from(data, "base64").toString("utf-8");
  } catch (e) {
    return "";
  }
}

function parseStreams(decoded, origin) {
  if (!decoded) return [];
  const list = [];
  for (const part of decoded.split(",")) {
    const m = part.trim().match(/^\[([^\]]+)\](.+)$/);
    if (!m) continue;
    const q = m[1].trim();
    const urls = m[2].split(" or ").map((u) => u.trim()).filter(Boolean);
    const mp4 = urls.find((u) => u.toLowerCase().includes(".mp4"));
    const hls = urls.find((u) => u.toLowerCase().includes(".m3u8"));
    const url = mp4 || hls || urls[0];
    if (url) {
      list.push({
        quality: q,
        name: `HDRezka • ${q} (${mp4 ? "MP4" : "HLS"})`,
        url: `${origin}/proxy?url=${encodeURIComponent(url)}`
      });
    }
  }
  const rank = (q) => (q.includes("1080p Ultra") ? 5 : q.includes("1080") ? 4 : q.includes("720") ? 3 : q.includes("480") ? 2 : 1);
  list.sort((a, b) => rank(b.quality) - rank(a.quality));
  return list;
}

function parseCards(html, origin, catType) {
  const chunks = html.split('<div class="b-content__inline_item"');
  const items = [];
  for (let i = 1; i < chunks.length; i++) {
    const c = chunks[i];
    const idM = c.match(/data-id="(\d+)"/);
    const urlM = c.match(/data-url="([^"]+)"/);
    const imgM = c.match(/<img[^>]+src="([^"]+)"/);
    const linkM = c.match(/class="b-content__inline_item-link"[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
    const infoM = c.match(/class="b-content__inline_item-link"[\s\S]*?<div>([^<]+)<\/div>/);
    if (!idM || !urlM || !linkM) continue;

    const info = infoM ? infoM[1].trim() : "";
    const yearM = info.match(/\b(19\d\d|20\d\d)\b/);
    items.push({
      id: "rz_" + idM[1],
      type: catType,
      rezkaUrl: urlM[1],
      title: linkM[1].trim(),
      year: yearM ? yearM[1] : "",
      genres: info,
      poster: imgM ? `${origin}/proxy?img=1&url=${encodeURIComponent(imgM[1])}` : ""
    });
  }
  return items;
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const proto = req.headers["x-forwarded-proto"] || "http";
  const origin = `${proto}://${host}`;
  const reqUrl = new URL(req.url, origin);
  const path = reqUrl.pathname;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const sendJson = (obj, code = 200) => {
    res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(obj));
  };

  if (path === "/" || path === "/test") {
    const testRes = await rezkaRequest("/films/?filter=popular");
    const cards = parseCards(testRes.text, origin, "movie");
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(
      `LG TV NODE GATEWAY OK\nЗеркало: ${testRes.base}\nСтатус HDRezka: ${testRes.ok ? "ПРОБИТО (ЧИСТО)" : "БЛОК"}\nНайдено карточек: ${cards.length}`
    );
  }

  if (path === "/tv") {
    const sources = [
      "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_russia.m3u8",
      "https://iptv-org.github.io/iptv/countries/ru.m3u"
    ];
    const fetched = await Promise.allSettled(
      sources.map((u) => fetch(u, { headers: { "User-Agent": UA } }).then((r) => (r.ok ? r.text() : "")))
    );
    const channels = [];
    const seen = new Set();
    for (const item of fetched) {
      if (item.status !== "fulfilled" || !item.value) continue;
      let meta = null;
      for (const raw of item.value.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line) continue;
        if (line.startsWith("#EXTINF:")) {
          const comma = line.lastIndexOf(",");
          const name = comma !== -1 ? line.substring(comma + 1).trim() : "Канал";
          const grp = line.match(/group-title="([^"]*)"/i);
          const logo = line.match(/tvg-logo="([^"]*)"/i);
          meta = { name, group: grp ? grp[1] : "Эфир", logo: logo ? logo[1] : "" };
        } else if (!line.startsWith("#")) {
          if (meta && !line.includes(".mpd")) {
            const key = meta.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              channels.push({
                id: "tv_" + channels.length,
                type: "tv",
                title: meta.name,
                group: meta.group,
                isHd: /hd|1080|720|fhd/i.test(meta.name),
                poster: meta.logo ? `${origin}/proxy?img=1&url=${encodeURIComponent(meta.logo)}` : "",
                url: `${origin}/proxy?url=${encodeURIComponent(line)}`
              });
            }
          }
          meta = null;
        }
      }
    }
    channels.sort((a, b) => (b.isHd ? 1 : 0) - (a.isHd ? 1 : 0));
    return sendJson({ channels: channels.slice(0, 160) });
  }

  if (path === "/catalog") {
    const cat = reqUrl.searchParams.get("type") === "series" ? "series" : "films";
    const page = parseInt(reqUrl.searchParams.get("page") || "1", 10) || 1;
    const r = await rezkaRequest(`/${cat}/${page > 1 ? `page/${page}/` : ""}?filter=popular`);
    return sendJson({ items: parseCards(r.text, origin, cat) });
  }

  if (path === "/search") {
    const q = (reqUrl.searchParams.get("q") || "").trim();
    if (!q) return sendJson({ items: [] });
    const r = await rezkaRequest(`/search/?do=search&subaction=search&q=${encodeURIComponent(q)}`);
    return sendJson({ items: parseCards(r.text, origin, "movie") });
  }

  if (path === "/resolve") {
    const title = reqUrl.searchParams.get("title") || "";
    let pageUrl = reqUrl.searchParams.get("rezkaUrl") || "";

    if (!pageUrl && title) {
      const sRes = await rezkaRequest(`/search/?do=search&subaction=search&q=${encodeURIComponent(title)}`);
      const cards = parseCards(sRes.text, origin, "movie");
      if (cards[0]) pageUrl = cards[0].rezkaUrl;
    }
    if (!pageUrl) return sendJson({ streams: [], desc: "Фильм не найден." });

    const r = await rezkaRequest(pageUrl);
    if (!r.ok) return sendJson({ streams: [], desc: "Не удалось открыть страницу фильма." });

    const descM = r.text.match(/<div class="b-post__description_text">([\s\S]*?)<\/div>/);
    const desc = descM ? descM[1].replace(/<[^>]+>/g, "").trim() : "";

    let streams = [];
    const streamM = r.text.match(/"streams"\s*:\s*"([^"]+)"/);
    if (streamM) streams = parseStreams(decodeRezkaStreams(streamM[1]), origin);

    if (streams.length === 0) {
      const initM = r.text.match(/initCDN(Movies|Series)Events\(\s*(\d+)\s*,\s*(\d+)/);
      if (initM) {
        const isSeries = initM[1] === "Series";
        const body = new URLSearchParams({
          id: initM[2],
          translator_id: initM[3],
          action: isSeries ? "get_stream" : "get_movie"
        });
        if (isSeries) { body.set("season", "1"); body.set("episode", "1"); }

        const aRes = await rezkaRequest(`/ajax/get_cdn_series/?t=${Date.now()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: body.toString()
        });
        try {
          const aData = JSON.parse(aRes.text);
          if (aData && aData.url) streams = parseStreams(decodeRezkaStreams(aData.url), origin);
        } catch (e) {}
      }
    }
    return sendJson({ streams, desc });
  }

  if (path === "/proxy") {
    const target = reqUrl.searchParams.get("url");
    const isImg = reqUrl.searchParams.get("img") === "1";
    if (!target) { res.writeHead(400); return res.end("Missing url"); }

    try {
      const targetObj = new URL(target);
      const fwdHeaders = {
        "User-Agent": UA,
        "Referer": targetObj.origin + "/"
      };
      if (req.headers.range) fwdHeaders["Range"] = req.headers.range;

      const upstream = await fetch(target, { headers: fwdHeaders, redirect: "follow" });
      const ct = upstream.headers.get("content-type") || "";
      const finalUrl = upstream.url || target;

      if (!isImg && (finalUrl.toLowerCase().includes(".m3u8") || ct.toLowerCase().includes("mpegurl"))) {
        const text = await upstream.text();
        const baseDir = finalUrl.substring(0, finalUrl.lastIndexOf("/") + 1);
        const finalOrigin = new URL(finalUrl).origin;
        const toAbs = (u) => u.startsWith("//") ? "https:" + u : (u.startsWith("http") ? u : (u.startsWith("/") ? finalOrigin + u : baseDir + u));

        const rewritten = text.split(/\r?\n/).map((line) => {
          const t = line.trim();
          if (!t) return line;
          if (t.startsWith("#")) {
            return t.replace(/URI="([^"]+)"/gi, (_, uri) => `URI="${origin}/proxy?url=${encodeURIComponent(toAbs(uri))}"`);
          }
          return `${origin}/proxy?url=${encodeURIComponent(toAbs(t))}`;
        }).join("\n");

        res.writeHead(upstream.status, {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-cache"
        });
        return res.end(rewritten);
      }

      const outHeaders = {};
      if (ct) outHeaders["Content-Type"] = ct;
      const cl = upstream.headers.get("content-length");
      if (cl) outHeaders["Content-Length"] = cl;
      const cr = upstream.headers.get("content-range");
      if (cr) outHeaders["Content-Range"] = cr;
      outHeaders["Accept-Ranges"] = "bytes";
      if (isImg) outHeaders["Cache-Control"] = "public, max-age=86400";

      res.writeHead(upstream.status, outHeaders);
      if (upstream.body) {
        const reader = upstream.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
      }
      return res.end();
    } catch (e) {
      res.writeHead(502);
      return res.end("Proxy error");
    }
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("LG TV Gateway listening on port " + PORT);
});
