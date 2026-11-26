const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const MIRRORS = ["https://rezka.ag", "https://hdrezka.me", "https://rezka-ua.tv"];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const cookieJar = {};

function solveAnubis(html) {
  const m = html.match(/<script[^>]*id="anubis_challenge"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return null;
  const parsed = JSON.parse(m[1]);
  const ch = parsed.challenge || parsed;
  const challengeStr = ch.randomData;
  const challengeId = ch.id;
  if (!challengeStr || !challengeId) return null;

  const difficulty = (parsed.rules && parsed.rules.difficulty) || ch.difficulty || 2;
  const prefix = "0".repeat(difficulty);

  const t0 = Date.now();
  let nonce = 0;
  let hash = "";
  while (nonce < 5000000) {
    hash = crypto.createHash("sha256").update(challengeStr + nonce).digest("hex");
    if (hash.startsWith(prefix)) {
      return {
        id: challengeId,
        response: hash,
        nonce,
        elapsedTime: Math.max(10, Date.now() - t0)
      };
    }
    nonce++;
  }
  return null;
}

async function ensureCookie(base) {
  if (cookieJar[base]) return cookieJar[base];
  const target = base + "/films/?filter=popular";
  const res = await fetch(target, {
    headers: { "User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9", "Referer": base + "/" }
  });
  const text = await res.text();
  if (text.includes("anubis_challenge")) {
    const initCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")].filter(Boolean);
    const initCookieHeader = initCookies.map((c) => c.split(";")[0]).filter((c) => !c.endsWith("=")).join("; ");
    const solved = solveAnubis(text);
    if (solved) {
      const passUrl = `${base}/.within.website/x/cmd/anubis/api/pass-challenge?id=${encodeURIComponent(solved.id)}&response=${solved.response}&nonce=${solved.nonce}&redir=${encodeURIComponent(target)}&elapsedTime=${solved.elapsedTime}`;
      const passRes = await fetch(passUrl, {
        headers: { "User-Agent": UA, "Referer": target, ...(initCookieHeader ? { Cookie: initCookieHeader } : {}) },
        redirect: "manual"
      });
      const rawCookies = passRes.headers.getSetCookie ? passRes.headers.getSetCookie() : [passRes.headers.get("set-cookie")].filter(Boolean);
      const authCookie = rawCookies.map((c) => c.split(";")[0]).filter((c) => !c.endsWith("=")).join("; ");
      if (authCookie) cookieJar[base] = authCookie;
    }
  }
  return cookieJar[base] || "";
}

async function rezkaRequest(path, opts = {}) {
  for (const base of MIRRORS) {
    const target = path.startsWith("http") ? path : base + path;
    try {
      let ck = await ensureCookie(base);
      const makeHeaders = (cookieVal) => ({
        "User-Agent": UA,
        "Accept": "*/*",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Origin": base,
        "Referer": base + "/",
        ...(cookieVal ? { Cookie: cookieVal } : {}),
        ...(opts.headers || {})
      });

      let res = await fetch(target, { ...opts, headers: makeHeaders(ck), redirect: "follow" });
      let text = await res.text();

      if (text.includes("anubis_challenge")) {
        delete cookieJar[base];
        ck = await ensureCookie(base);
        res = await fetch(target, { ...opts, headers: makeHeaders(ck), redirect: "follow" });
        text = await res.text();
      }

      if (res.ok && !text.includes("anubis_challenge")) {
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
        isHls: !mp4 && Boolean(hls),
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

const TV_UI_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>LGTV Cinema</title>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0b0e14; color: #f1f5f9; font-family: Arial, sans-serif; overflow: hidden; }
  #topbar { height: 64px; background: #131924; padding: 10px 24px; border-bottom: 2px solid #1e293b; }
  .tab { display: inline-block; padding: 10px 22px; margin-right: 12px; background: #1e293b; color: #cbd5e1; border-radius: 6px; font-size: 20px; font-weight: bold; cursor: pointer; border: 3px solid transparent; }
  .tab.active { background: #2563eb; color: #fff; }
  .focus { border-color: #facc15 !important; transform: scale(1.04); }
  #status { float: right; line-height: 44px; color: #94a3b8; font-size: 16px; }
  #searchBar { display: none; padding: 12px 24px; background: #0f141e; border-bottom: 1px solid #1e293b; }
  #searchInput { width: 520px; padding: 10px 14px; font-size: 20px; background: #1e293b; color: #fff; border: 3px solid #334155; border-radius: 6px; }
  .kbd-btn { display: inline-block; padding: 8px 13px; margin: 4px 3px; background: #1e293b; color: #fff; font-size: 18px; border-radius: 4px; border: 2px solid transparent; cursor: pointer; }
  #grid { height: 630px; overflow-y: auto; padding: 18px 24px; }
  .card { display: inline-block; vertical-align: top; width: 185px; margin: 0 14px 18px 0; background: #161d2b; border-radius: 8px; overflow: hidden; border: 3px solid transparent; cursor: pointer; }
  .card img { width: 185px; height: 255px; object-fit: cover; background: #1e293b; display: block; }
  .card.tv-card img { height: 110px; object-fit: contain; padding: 10px; }
  .card-title { padding: 8px 10px 4px; font-size: 16px; font-weight: bold; height: 46px; overflow: hidden; }
  .card-sub { padding: 0 10px 8px; font-size: 13px; color: #94a3b8; height: 24px; overflow: hidden; }
  #modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(5,8,15,0.95); padding: 36px 56px; z-index: 50; overflow-y: auto; }
  #modalTitle { font-size: 30px; font-weight: bold; margin-bottom: 10px; color: #fff; }
  #modalDesc { font-size: 17px; color: #cbd5e1; max-width: 920px; max-height: 160px; overflow: auto; margin-bottom: 18px; line-height: 1.4; }
  #seriesControls { display: none; margin-bottom: 16px; }
  .ep-btn { display: inline-block; padding: 8px 16px; margin: 0 8px 8px 0; background: #1e293b; color: #fff; font-size: 18px; border-radius: 6px; border: 3px solid transparent; cursor: pointer; }
  .stream-btn { display: block; width: 540px; padding: 13px 20px; margin-bottom: 10px; background: #1e293b; color: #fff; font-size: 20px; border-radius: 6px; border: 3px solid transparent; text-align: left; cursor: pointer; }
  #playerWrap { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #000; z-index: 100; }
  video { width: 100%; height: 100%; }
  #playerHud { position: fixed; top: 20px; left: 30px; background: rgba(0,0,0,0.75); padding: 10px 18px; border-radius: 6px; font-size: 20px; color: #facc15; z-index: 101; }
</style>
</head>
<body>
<div id="topbar">
  <span class="tab active focus" data-tab="films">Фильмы</span>
  <span class="tab" data-tab="series">Сериалы</span>
  <span class="tab" data-tab="tv">ТВ-каналы</span>
  <span class="tab" data-tab="search">Поиск</span>
  <span id="status">Готово</span>
</div>

<div id="searchBar">
  <input id="searchInput" type="text" placeholder="Введите название фильма..." />
  <span class="kbd-btn" data-act="doSearch" style="background:#2563eb;">Найти</span>
  <span class="kbd-btn" data-act="bksp">← Стереть</span>
  <span class="kbd-btn" data-act="clear">Очистить</span>
  <div id="kbd" style="margin-top:8px;"></div>
</div>

<div id="grid"></div>

<div id="modal">
  <div id="modalTitle">Загрузка...</div>
  <div id="modalDesc"></div>
  <div id="seriesControls">
    <span class="ep-btn" data-act="prevSeason">◀ Сезон</span>
    <span id="seasonLabel" style="font-size:20px;font-weight:bold;margin:0 10px;">Сезон 1</span>
    <span class="ep-btn" data-act="nextSeason">Сезон ▶</span>
    <span style="margin-left:20px;"></span>
    <span class="ep-btn" data-act="prevEp">◀ Серия</span>
    <span id="epLabel" style="font-size:20px;font-weight:bold;margin:0 10px;">Серия 1</span>
    <span class="ep-btn" data-act="nextEp">Серия ▶</span>
  </div>
  <div id="streamList"></div>
  <button class="stream-btn" data-act="closeModal" style="background:#334155;margin-top:16px;">← Назад (Return)</button>
</div>

<div id="playerWrap">
  <div id="playerHud">Воспроизведение... (Назад — выход)</div>
  <video id="vid" controls autoplay></video>
</div>

<script>
var ORIGIN = window.location.origin;
var currentTab = "films";
var currentPage = 1;
var itemsCache = [];
var focusables = [];
var focusIdx = 0;
var activeItem = null;
var curSeason = 1;
var curEp = 1;
var hlsInstance = null;

function setStatus(t) { document.getElementById("status").innerText = t; }

function xhrGet(url, cb) {
  var x = new XMLHttpRequest();
  x.open("GET", url, true);
  x.onreadystatechange = function() {
    if (x.readyState === 4) {
      if (x.status === 200) {
        try { cb(null, JSON.parse(x.responseText)); } catch (e) { cb(e); }
      } else { cb(new Error("HTTP " + x.status)); }
    }
  };
  x.send();
}

function buildKeyboard() {
  var chars = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ0123456789 ";
  var html = "";
  for (var i = 0; i < chars.length; i++) {
    var ch = chars[i] === " " ? "ПРОБЕЛ" : chars[i];
    html += '<span class="kbd-btn" data-ch="' + chars[i] + '">' + ch + '</span>';
  }
  document.getElementById("kbd").innerHTML = html;
}

function refreshFocus(resetToGrid) {
  var prev = focusables[focusIdx];
  if (prev) prev.className = prev.className.replace(" focus", "");
  var list = [];
  if (document.getElementById("playerWrap").style.display === "block") {
    focusables = [];
    return;
  }
  if (document.getElementById("modal").style.display === "block") {
    var mbtns = document.getElementById("modal").querySelectorAll(".ep-btn, .stream-btn");
    for (var i = 0; i < mbtns.length; i++) {
      if (mbtns[i].offsetParent !== null) list.push(mbtns[i]);
    }
  } else {
    var tabs = document.querySelectorAll(".tab");
    for (var i = 0; i < tabs.length; i++) list.push(tabs[i]);
    if (currentTab === "search") {
      var kbtns = document.getElementById("searchBar").querySelectorAll(".kbd-btn");
      for (var i = 0; i < kbtns.length; i++) list.push(kbtns[i]);
    }
    var cards = document.getElementById("grid").querySelectorAll(".card");
    for (var i = 0; i < cards.length; i++) list.push(cards[i]);
  }
  focusables = list;
  if (resetToGrid) {
    for (var j = 0; j < focusables.length; j++) {
      if (focusables[j].className.indexOf("card") !== -1) { focusIdx = j; break; }
    }
  }
  if (focusIdx >= focusables.length) focusIdx = 0;
  if (focusables[focusIdx]) {
    focusables[focusIdx].className += " focus";
    if (focusables[focusIdx].scrollIntoView) focusables[focusIdx].scrollIntoView(false);
  }
}

function renderCards(items, isTv) {
  itemsCache = items || [];
  var grid = document.getElementById("grid");
  if (!itemsCache.length) {
    grid.innerHTML = '<div style="font-size:22px;padding:30px;color:#94a3b8;">Ничего не найдено</div>';
    refreshFocus(false);
    return;
  }
  var html = "";
  for (var i = 0; i < itemsCache.length; i++) {
    var it = itemsCache[i];
    html += '<div class="card' + (isTv ? ' tv-card' : '') + '" data-idx="' + i + '">';
    html += '<img src="' + (it.poster || '') + '" onerror="this.style.visibility=\\'hidden\\'">';
    html += '<div class="card-title">' + it.title + '</div>';
    html += '<div class="card-sub">' + (isTv ? (it.group || 'ТВ') : (it.genres || it.year || '')) + '</div>';
    html += '</div>';
  }
  if (!isTv && currentTab !== "search") {
    html += '<div class="card" data-act="nextPage" style="height:325px;text-align:center;padding-top:130px;background:#1e293b;"><div style="font-size:22px;font-weight:bold;">Дальше →</div><div style="color:#94a3b8;margin-top:8px;">Стр. ' + (currentPage + 1) + '</div></div>';
  }
  grid.innerHTML = html;
  grid.scrollTop = 0;
  refreshFocus(true);
}

function loadTab(tab, page) {
  currentTab = tab;
  currentPage = page || 1;
  var tabs = document.querySelectorAll(".tab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].className = "tab" + (tabs[i].getAttribute("data-tab") === tab ? " active" : "");
  }
  document.getElementById("searchBar").style.display = tab === "search" ? "block" : "none";
  document.getElementById("grid").style.height = tab === "search" ? "460px" : "630px";

  if (tab === "search") {
    document.getElementById("grid").innerHTML = "";
    refreshFocus(false);
    return;
  }
  setStatus("Загрузка...");
  var url = tab === "tv" ? (ORIGIN + "/tv") : (ORIGIN + "/catalog?type=" + tab + "&page=" + currentPage);
  xhrGet(url, function(err, data) {
    if (err) { setStatus("Ошибка сети"); return; }
    setStatus("Готово");
    renderCards(tab === "tv" ? data.channels : data.items, tab === "tv");
  });
}

function fetchStreamsForModal() {
  if (!activeItem) return;
  document.getElementById("seasonLabel").innerText = "Сезон " + curSeason;
  document.getElementById("epLabel").innerText = "Серия " + curEp;
  document.getElementById("streamList").innerHTML = '<div style="color:#94a3b8;font-size:18px;">Загружаем потоки...</div>';
  var q = ORIGIN + "/resolve?rezkaUrl=" + encodeURIComponent(activeItem.rezkaUrl) + "&title=" + encodeURIComponent(activeItem.title) + "&s=" + curSeason + "&e=" + curEp;
  xhrGet(q, function(err, data) {
    if (err || !data) {
      document.getElementById("modalDesc").innerText = "Ошибка загрузки потоков.";
      return;
    }
    if (data.desc) document.getElementById("modalDesc").innerText = data.desc;
    document.getElementById("seriesControls").style.display = data.isSeries ? "block" : "none";
    var streams = data.streams || [];
    if (!streams.length) {
      document.getElementById("streamList").innerHTML = '<div style="color:#f87171;font-size:20px;">Потоки не найдены</div>';
    } else {
      var h = "";
      for (var i = 0; i < streams.length; i++) {
        h += '<button class="stream-btn" data-url="' + streams[i].url + '" data-hls="' + (streams[i].isHls ? '1' : '0') + '" data-name="' + activeItem.title + ' (' + streams[i].quality + ')">▶ ' + streams[i].name + '</button>';
      }
      document.getElementById("streamList").innerHTML = h;
    }
    focusIdx = 0;
    refreshFocus(false);
  });
}

function openItem(it) {
  if (it.type === "tv" && it.url) {
    playVideo(it.title, it.url, true);
    return;
  }
  activeItem = it;
  curSeason = 1;
  curEp = 1;
  var modal = document.getElementById("modal");
  modal.style.display = "block";
  document.getElementById("modalTitle").innerText = it.title;
  document.getElementById("modalDesc").innerText = "Получаем данные с HDRezka...";
  document.getElementById("seriesControls").style.display = "none";
  fetchStreamsForModal();
}

function playVideo(title, url, forceHls) {
  var wrap = document.getElementById("playerWrap");
  var vid = document.getElementById("vid");
  document.getElementById("playerHud").innerText = title + " (Назад — выход)";
  wrap.style.display = "block";

  if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }

  if (forceHls && window.Hls && Hls.isSupported()) {
    hlsInstance = new Hls();
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(vid);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() { vid.play(); });
  } else {
    vid.src = url;
    vid.play();
  }
}

function stopVideo() {
  var wrap = document.getElementById("playerWrap");
  var vid = document.getElementById("vid");
  if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
  vid.pause();
  vid.src = "";
  wrap.style.display = "none";
  refreshFocus(false);
}

function activateElement(el) {
  if (!el) return;
  var tab = el.getAttribute("data-tab");
  if (tab) { loadTab(tab, 1); return; }
  var act = el.getAttribute("data-act");
  var inp = document.getElementById("searchInput");
  if (act === "doSearch") {
    var q = inp.value;
    if (!q) return;
    setStatus("Поиск...");
    xhrGet(ORIGIN + "/search?q=" + encodeURIComponent(q), function(err, data) {
      setStatus("Готово");
      renderCards(data ? data.items : [], false);
    });
    return;
  }
  if (act === "bksp") { inp.value = inp.value.slice(0, -1); return; }
  if (act === "clear") { inp.value = ""; return; }
  if (act === "nextPage") { loadTab(currentTab, currentPage + 1); return; }
  if (act === "closeModal") { document.getElementById("modal").style.display = "none"; refreshFocus(false); return; }
  if (act === "prevSeason") { if (curSeason > 1) { curSeason--; curEp = 1; fetchStreamsForModal(); } return; }
  if (act === "nextSeason") { curSeason++; curEp = 1; fetchStreamsForModal(); return; }
  if (act === "prevEp") { if (curEp > 1) { curEp--; fetchStreamsForModal(); } return; }
  if (act === "nextEp") { curEp++; fetchStreamsForModal(); return; }
  var ch = el.getAttribute("data-ch");
  if (ch) { inp.value += ch; return; }
  var sUrl = el.getAttribute("data-url");
  if (sUrl) { playVideo(el.getAttribute("data-name"), sUrl, el.getAttribute("data-hls") === "1"); return; }
  var idx = el.getAttribute("data-idx");
  if (idx !== null) { openItem(itemsCache[parseInt(idx, 10)]); }
}

document.addEventListener("keydown", function(e) {
  var code = e.keyCode;
  if (document.getElementById("playerWrap").style.display === "block") {
    if (code === 461 || code === 27 || code === 8) { e.preventDefault(); stopVideo(); }
    return;
  }
  if (code === 461 || code === 27) {
    if (document.getElementById("modal").style.display === "block") {
      e.preventDefault();
      document.getElementById("modal").style.display = "none";
      refreshFocus(false);
    }
    return;
  }
  if (!focusables.length) return;
  var prev = focusables[focusIdx];
  if (prev) prev.className = prev.className.replace(" focus", "");

  if (code === 39) focusIdx = Math.min(focusables.length - 1, focusIdx + 1);
  else if (code === 37) focusIdx = Math.max(0, focusIdx - 1);
  else if (code === 40) focusIdx = Math.min(focusables.length - 1, focusIdx + 5);
  else if (code === 38) focusIdx = Math.max(0, focusIdx - 5);
  else if (code === 13) { e.preventDefault(); activateElement(focusables[focusIdx]); return; }

  if (focusables[focusIdx]) {
    focusables[focusIdx].className += " focus";
    if (focusables[focusIdx].scrollIntoView) focusables[focusIdx].scrollIntoView(false);
  }
});

document.addEventListener("click", function(e) {
  var t = e.target;
  while (t && t !== document.body) {
    if (t.getAttribute && (t.getAttribute("data-tab") || t.getAttribute("data-act") || t.getAttribute("data-ch") || t.getAttribute("data-url") || t.getAttribute("data-idx") !== null)) {
      activateElement(t);
      return;
    }
    t = t.parentNode;
  }
});

buildKeyboard();
loadTab("films", 1);
</script>
</body>
</html>`;

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

  if (path === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(TV_UI_HTML);
  }

  if (path === "/debug-ajax") {
    const r = await rezkaRequest("/series/comedy/1191-druzya-1994.html");
    const init = r.text.match(/initCDNSeriesEvents\([^)]+\)/);
    const fav = r.text.match(/ctrl_favs[^>]+value="([^"]+)"/);
    const body = new URLSearchParams({
      id: "1191", translator_id: "238", season: "1", episode: "1",
      favs: fav ? fav[1] : "", action: "get_stream"
    });
    const a = await rezkaRequest(`/ajax/get_cdn_series/?t=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest" },
      body: body.toString()
    });
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(`Mirror: ${r.base}\ninit: ${init ? init[0] : "none"}\nfav: ${fav ? fav[1] : "none"}\nAJAX: ${a.text}`);
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
    const season = reqUrl.searchParams.get("s") || "1";
    const episode = reqUrl.searchParams.get("e") || "1";
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
    const favM = r.text.match(/id="ctrl_favs"\s+value="([^"]+)"/);
    const favs = favM ? favM[1] : "";

    let isSeries = false;
    let streams = [];
    const streamM = r.text.match(/"streams"\s*:\s*"([^"]+)"/);
    if (streamM) streams = parseStreams(decodeRezkaStreams(streamM[1]), origin);

    const initM = r.text.match(/initCDN(Movies|Series)Events\(\s*(\d+)\s*,\s*(\d+)/);
    if (initM) {
      isSeries = initM[1] === "Series";
      const postId = initM[2];

      const trIds = [initM[3]];
      const trMatches = r.text.matchAll(/data-translator_id="(\d+)"/g);
      for (const tm of trMatches) {
        if (!trIds.includes(tm[1])) trIds.push(tm[1]);
      }

      if (streams.length === 0 || isSeries) {
        for (const tid of trIds.slice(0, 4)) {
          const body = new URLSearchParams({
            id: postId,
            translator_id: tid,
            is_camrip: "0",
            is_ads: "0",
            is_director: "0",
            favs: favs,
            action: isSeries ? "get_stream" : "get_movie"
          });
          if (isSeries) {
            body.set("season", season);
            body.set("episode", episode);
          }

          const aRes = await rezkaRequest(`/ajax/get_cdn_series/?t=${Date.now()}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "X-Requested-With": "XMLHttpRequest",
              "Referer": pageUrl.startsWith("http") ? pageUrl : r.base + pageUrl
            },
            body: body.toString()
          });
          try {
            const aData = JSON.parse(aRes.text);
            if (aData && aData.url) {
              const parsed = parseStreams(decodeRezkaStreams(aData.url), origin);
              if (parsed.length > 0) {
                streams = parsed;
                break;
              }
            }
          } catch (e) {}
        }
      }
    }
    return sendJson({ streams, desc, isSeries });
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
