if (path === "/" || path === "/test") {
    let diag = [];
    for (const base of MIRRORS) {
      try {
        const r = await fetch(base + "/films/?filter=popular", {
          headers: { "User-Agent": UA, "Accept-Language": "ru-RU,ru;q=0.9", "Referer": base + "/" }
        });
        const t = await r.text();
        diag.push(`=== ${base} (HTTP ${r.status}, ${t.length} байт) ===\n${t.slice(0, 600).replace(/\s+/g, " ")}`);
      } catch (e) {
        diag.push(`=== ${base} ОШИБКА: ${e.message} ===`);
      }
    }
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(diag.join("\n\n"));
  }
