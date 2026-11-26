<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=1280, initial-scale=1.0" />
<title>LG TV — Lampa & HD IPTV</title>
<style type="text/css">
* { margin: 0; padding: 0; }
html, body {
    width: 1280px;
    height: 720px;
    background-color: #0b0f17;
    color: #eef3fa;
    font-family: Arial, Helvetica, sans-serif;
    overflow: hidden;
}
#app {
    width: 1280px;
    height: 720px;
    position: relative;
}
#topbar {
    width: 1232px;
    height: 62px;
    padding: 12px 24px 0 24px;
    background-color: #131a26;
    border-bottom: 2px solid #233047;
}
#brand {
    float: left;
    font-size: 24px;
    font-weight: bold;
    color: #f5c518;
    line-height: 44px;
    margin-right: 24px;
}
.tab {
    float: left;
    height: 42px;
    line-height: 42px;
    padding: 0 18px;
    margin-right: 10px;
    background-color: #1b2436;
    border: 3px solid #2b3a54;
    color: #a7b6cc;
    font-size: 18px;
    font-weight: bold;
}
.tab-active {
    background-color: #253654;
    color: #ffffff;
    border-color: #4f78b8;
}
#status {
    float: right;
    line-height: 44px;
    font-size: 15px;
    color: #8fa1bc;
}
.panel {
    width: 1232px;
    height: 576px;
    padding: 16px 24px 0 24px;
    display: none;
    overflow: hidden;
    position: relative;
}
.panel-vis { display: block; }

/* Сетка ТВ-каналов */
.card {
    float: left;
    width: 222px;
    height: 154px;
    margin: 0 20px 20px 0;
    background-color: #151d2b;
    border: 4px solid #222e42;
    position: relative;
}
.card-logo {
    width: 222px;
    height: 98px;
    line-height: 98px;
    text-align: center;
    font-weight: bold;
    overflow: hidden;
}
.card-logo img {
    max-width: 140px;
    max-height: 76px;
    vertical-align: middle;
}
.card-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 7px;
    background-color: #0b0f17;
    color: #f5c518;
    font-size: 12px;
    font-weight: bold;
    border: 1px solid #f5c518;
}
.card-num {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 6px;
    background-color: #0b0f17;
    color: #c5d2e6;
    font-size: 12px;
    font-weight: bold;
}
.card-name {
    height: 32px;
    line-height: 32px;
    padding: 4px 10px 0 10px;
    font-size: 17px;
    font-weight: bold;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
}
.card-group {
    padding: 0 10px;
    font-size: 13px;
    color: #8b9db8;
    white-space: nowrap;
    overflow: hidden;
}

/* Вкладка Кино и Поиск */
.mov-left {
    float: left;
    width: 780px;
    height: 556px;
    background-color: #121824;
    border: 2px solid #233047;
}
.mov-right {
    float: right;
    width: 430px;
    height: 556px;
    background-color: #121824;
    border: 2px solid #233047;
    padding: 12px;
    box-sizing: border-box;
}
.search-row {
    padding: 10px;
    background-color: #171f2e;
    border-bottom: 2px solid #233047;
}
.search-box {
    display: inline-block;
    width: 520px;
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    background-color: #0b0f17;
    border: 3px solid #304261;
    color: #ffffff;
    font-size: 18px;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
}
.btn-sm {
    display: inline-block;
    height: 36px;
    line-height: 36px;
    padding: 0 16px;
    margin-left: 8px;
    background-color: #202d45;
    border: 3px solid #35496b;
    color: #ffffff;
    font-size: 17px;
    font-weight: bold;
    vertical-align: middle;
}
#mov-viewport {
    width: 780px;
    height: 490px;
    overflow: hidden;
    position: relative;
}
.mov-item {
    height: 66px;
    margin: 8px 10px;
    padding: 6px 10px;
    background-color: #172030;
    border: 3px solid #233047;
    overflow: hidden;
}
.mov-poster {
    float: left;
    width: 48px;
    height: 64px;
    background-color: #233047;
    margin-right: 12px;
    text-align: center;
    line-height: 64px;
    font-size: 12px;
    color: #f5c518;
    font-weight: bold;
}
.mov-poster img {
    width: 48px;
    height: 64px;
}
.mov-title {
    font-size: 19px;
    font-weight: bold;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    margin-bottom: 4px;
}
.mov-desc {
    font-size: 14px;
    color: #96a8c4;
    white-space: nowrap;
    overflow: hidden;
}
.vkb-title {
    font-size: 16px;
    font-weight: bold;
    color: #f5c518;
    margin-bottom: 10px;
}
.vkb-row {
    margin-bottom: 6px;
    white-space: nowrap;
}
.vkb-key {
    display: inline-block;
    min-width: 28px;
    height: 34px;
    line-height: 34px;
    padding: 0 4px;
    margin-right: 3px;
    text-align: center;
    background-color: #1e293d;
    border: 2px solid #314363;
    color: #ffffff;
    font-size: 16px;
    font-weight: bold;
}
.vkb-wide {
    padding: 0 10px;
    background-color: #263652;
}
#mov-preview {
    margin-top: 14px;
    padding: 10px;
    background-color: #161e2e;
    border: 1px solid #283752;
    font-size: 14px;
    color: #c5d2e6;
    line-height: 1.4;
    height: 185px;
    overflow: hidden;
}
#footer {
    width: 1232px;
    height: 44px;
    line-height: 44px;
    padding: 0 24px;
    background-color: #131a26;
    border-top: 2px solid #233047;
    font-size: 15px;
    color: #9cb0cc;
}
.k {
    display: inline-block;
    padding: 1px 8px;
    margin-right: 4px;
    background-color: #24324a;
    border: 1px solid #445e87;
    color: #ffffff;
    font-weight: bold;
    font-size: 13px;
}
.focused {
    border-color: #f5c518 !important;
    background-color: #1f3354 !important;
}
#player-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 1280px;
    height: 720px;
    background-color: #000000;
    z-index: 100;
    display: none;
}
#player-holder {
    width: 1280px;
    height: 720px;
}
#osd {
    position: absolute;
    left: 40px;
    bottom: 36px;
    width: 1160px;
    padding: 14px 20px;
    background-color: #101622;
    border: 3px solid #f5c518;
    z-index: 110;
    display: none;
}
#osd-title {
    font-size: 24px;
    font-weight: bold;
    color: #f5c518;
    margin-bottom: 6px;
}
#osd-state {
    font-size: 17px;
    color: #e6ecf5;
}
</style>
</head>
<body>
<div id="app">
    <div id="topbar">
        <div id="brand">LG TV</div>
        <div id="tab-0" class="tab tab-active">1. ТВ-каналы HD (<span id="cnt-tv">0</span>)</div>
        <div id="tab-1" class="tab">2. Кино и Поиск (<span id="cnt-mov">0</span>)</div>
        <div id="status">Подключение к серверу...</div>
    </div>

    <div id="panel-0" class="panel panel-vis">
        <div id="tv-grid"></div>
    </div>

    <div id="panel-1" class="panel">
        <div class="mov-left">
            <div class="search-row">
                <div id="search-box" class="search-box">Нажмите ОК для ввода названия...</div>
                <div id="btn-search" class="btn-sm">Найти</div>
                <div id="btn-reset" class="btn-sm">Топ</div>
            </div>
            <div id="mov-viewport">
                <div id="mov-list"></div>
            </div>
        </div>
        <div class="mov-right">
            <div class="vkb-title">Клавиатура (стрелки + ОК):</div>
            <div id="vkb-rows"></div>
            <div id="mov-preview">Выберите фильм слева и нажмите ОК — сервер сам найдёт поток.</div>
        </div>
    </div>

    <div id="footer">
        <span class="k">СТРЕЛКИ</span> Выбор &nbsp;&nbsp;
        <span class="k">ОК</span> Смотреть &nbsp;&nbsp;
        <span class="k">CH+ / CH-</span> Каналы &nbsp;&nbsp;
        <span class="k">BACK</span> Стоп / Наверх
    </div>

    <div id="player-screen">
        <div id="player-holder"></div>
        <div id="osd">
            <div id="osd-title">Воспроизведение</div>
            <div id="osd-state">Подключение...</div>
        </div>
    </div>
</div>

<script type="text/javascript">
(function () {
    var WORKER_URL = "http://lgtv.tagirahmadiev7.workers.dev";
    var COLS = 5;

    var state = {
        tab: 0,
        zone: "tv_grid",
        tvIdx: 0,
        movBarIdx: 0,
        movIdx: 0,
        vkbLang: "RU",
        vkbRow: 1,
        vkbCol: 0,
        query: "",
        tv: [],
        movies: [],
        inPlayer: false
    };

    var osdTimer = null;
    var pollTimer = null;

    var keyboards = {
        RU: [
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            ["Й", "Ц", "У", "К", "Е", "Н", "Г", "Ш", "Щ", "З", "Х"],
            ["Ф", "Ы", "В", "А", "П", "Р", "О", "Л", "Д", "Ж", "Э"],
            ["Я", "Ч", "С", "М", "И", "Т", "Ь", "Б", "Ю"],
            ["RU/EN", "ПРОБЕЛ", "СТЕРЕТЬ", "НАЙТИ"]
        ],
        EN: [
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
            ["Z", "X", "C", "V", "B", "N", "M"],
            ["RU/EN", "ПРОБЕЛ", "СТЕРЕТЬ", "НАЙТИ"]
        ]
    };

    function byId(id) { return document.getElementById(id); }
    function trimStr(s) { return s ? s.replace(/^\s+|\s+$/g, "") : ""; }
    function esc(s) {
        if (!s) { return ""; }
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    function addClass(el, cls) {
        if (el && (" " + el.className + " ").indexOf(" " + cls + " ") === -1) {
            el.className = trimStr(el.className + " " + cls);
        }
    }
    function removeClass(el, cls) {
        if (!el || !el.className) { return; }
        var p = el.className.split(" "), out = [];
        for (var i = 0; i < p.length; i++) {
            if (p[i] && p[i] !== cls) { out.push(p[i]); }
        }
        el.className = out.join(" ");
    }

    function proxyUrl(rawUrl) {
        if (!rawUrl) { return ""; }
        if (rawUrl.indexOf(WORKER_URL) === 0) { return rawUrl; }
        return WORKER_URL + "/proxy?url=" + encodeURIComponent(rawUrl);
    }

    function getLogoStyle(name) {
        var n = name.toLowerCase();
        if (n.indexOf("первый") !== -1) { return { bg: "#0055a5", fg: "#ffffff", txt: "1" }; }
        if (n.indexOf("матч") !== -1) { return { bg: "#c8102e", fg: "#ffffff", txt: "МАТЧ!" }; }
        if (n.indexOf("нтв") !== -1) { return { bg: "#008f45", fg: "#ffffff", txt: "НТВ" }; }
        if (n.indexOf("пятый") !== -1) { return { bg: "#b71c1c", fg: "#ffffff", txt: "5" }; }
        if (n.indexOf("россия") !== -1) { return { bg: "#0d47a1", fg: "#ffffff", txt: "РОССИЯ" }; }
        if (n.indexOf("рен") !== -1) { return { bg: "#e65100", fg: "#ffffff", txt: "РЕН ТВ" }; }
        if (n.indexOf("стс") !== -1) { return { bg: "#f5c518", fg: "#111111", txt: "СТС" }; }
        if (n.indexOf("тнт") !== -1) { return { bg: "#d32f2f", fg: "#ffeb3b", txt: "ТНТ" }; }
        if (n.indexOf("пятница") !== -1) { return { bg: "#d81b60", fg: "#ffffff", txt: "ПЯТНИЦА!" }; }
        if (n.indexOf("звезда") !== -1) { return { bg: "#9e1b1b", fg: "#f5c518", txt: "ЗВЕЗДА" }; }
        var shortTxt = name.length > 8 ? name.substring(0, 7) : name;
        return { bg: "#26344d", fg: "#dce6f5", txt: shortTxt.toUpperCase() };
    }

    function xhrGet(url, onOk, onErr) {
        var xhr = new XMLHttpRequest();
        try { xhr.open("GET", url, true); } catch (e) { if (onErr) { onErr(); } return; }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 0 && xhr.responseText)) {
                    onOk(xhr.responseText);
                } else if (onErr) { onErr(); }
            }
        };
        try { xhr.send(null); } catch (e2) { if (onErr) { onErr(); } }
    }

    function parseM3U(text) {
        var lines = text.split(/\r?\n/), res = [], meta = null;
        for (var i = 0; i < lines.length; i++) {
            var line = trimStr(lines[i]);
            if (!line) { continue; }
            if (line.indexOf("#EXTINF:") === 0) {
                var c = line.lastIndexOf(",");
                var name = (c !== -1) ? trimStr(line.substring(c + 1)) : "Канал";
                var gm = line.match(/group-title="([^"]*)"/i);
                meta = { name: name, group: (gm && gm[1]) ? gm[1] : "Эфир" };
            } else if (line.charAt(0) !== "#") {
                if (line.indexOf(".mpd") === -1) {
                    res.push({
                        name: meta ? meta.name : ("Канал " + (res.length + 1)),
                        group: meta ? meta.group : "Локальный",
                        isHd: meta && meta.name.toUpperCase().indexOf("HD") !== -1,
                        url: proxyUrl(line)
                    });
                }
                meta = null;
            }
        }
        return res;
    }

    function renderTvGrid() {
        var g = byId("tv-grid");
        var list = state.tv;
        byId("cnt-tv").innerHTML = String(list.length);
        if (list.length === 0) {
            g.innerHTML = '<div style="padding:30px;color:#9cb0cc;">Загрузка списка каналов с сервера...</div>';
            return;
        }
        var max = list.length > 120 ? 120 : list.length;
        var html = "";
        for (var i = 0; i < max; i++) {
            var item = list[i];
            var st = getLogoStyle(item.name);
            var badge = item.isHd ? '<div class="card-badge">HD</div>' : '';
            var fs = st.txt.length > 6 ? "20px" : (st.txt.length > 4 ? "26px" : "34px");
            var mr = ((i + 1) % COLS === 0) ? "0" : "20px";
            var logoContent = item.logo
                ? '<img src="' + esc(item.logo) + '" alt="" />'
                : esc(st.txt);

            html += '<div id="tv-card-' + i + '" class="card" style="margin-right:' + mr + ';">' +
                '<div class="card-logo" style="background-color:' + st.bg + ';color:' + st.fg + ';font-size:' + fs + ';">' + logoContent + '</div>' +
                '<div class="card-num">' + (i + 1) + '</div>' + badge +
                '<div class="card-name">' + esc(item.name) + '</div>' +
                '<div class="card-group">' + esc(item.group) + '</div>' +
                '</div>';
        }
        g.innerHTML = html;
    }

    function renderMoviesList() {
        var box = byId("mov-list");
        var list = state.movies;
        byId("cnt-mov").innerHTML = String(list.length);
        if (list.length === 0) {
            box.innerHTML = '<div style="padding:20px;color:#9cb0cc;">Ничего не найдено</div>';
            return;
        }
        var html = "";
        for (var i = 0; i < list.length; i++) {
            var m = list[i];
            var pHtml = m.poster ? '<img src="' + esc(m.poster) + '" alt="" />' : esc(m.year || "HD");
            var rat = m.rating ? (" ★ " + m.rating) : "";
            html += '<div id="mov-item-' + i + '" class="mov-item">' +
                '<div class="mov-poster">' + pHtml + '</div>' +
                '<div class="mov-title">' + (i + 1) + '. ' + esc(m.title) + ' (' + esc(m.year || "") + rat + ')</div>' +
                '<div class="mov-desc">' + esc(m.desc || "") + '</div>' +
                '</div>';
        }
        box.innerHTML = html;
        updateMoviePreview();
    }

    function updateMoviePreview() {
        var m = state.movies[state.movIdx];
        if (!m) { return; }
        byId("mov-preview").innerHTML = "<b>" + esc(m.title) + "</b><br><br>" + esc(m.desc || "");
    }

    function renderKeyboard() {
        var rows = keyboards[state.vkbLang];
        var html = "";
        for (var r = 0; r < rows.length; r++) {
            html += '<div class="vkb-row">';
            for (var c = 0; c < rows[r].length; c++) {
                var lbl = rows[r][c];
                var wide = lbl.length > 1 ? " vkb-wide" : "";
                var foc = (state.zone === "vkb" && state.vkbRow === r && state.vkbCol === c) ? " focused" : "";
                html += '<span class="vkb-key' + wide + foc + '">' + esc(lbl) + '</span>';
            }
            html += '</div>';
        }
        byId("vkb-rows").innerHTML = html;
        byId("search-box").innerHTML = state.query
            ? (esc(state.query) + "_")
            : '<span style="color:#7d95b8;">Нажмите ОК для ввода названия...</span>';
    }

    function pressVkb() {
        var rows = keyboards[state.vkbLang];
        var key = rows[state.vkbRow][state.vkbCol];
        if (key === "RU/EN") {
            state.vkbLang = state.vkbLang === "RU" ? "EN" : "RU";
            if (state.vkbCol >= keyboards[state.vkbLang][state.vkbRow].length) {
                state.vkbCol = keyboards[state.vkbLang][state.vkbRow].length - 1;
            }
        } else if (key === "ПРОБЕЛ") {
            state.query += " ";
        } else if (key === "СТЕРЕТЬ") {
            if (state.query.length > 0) {
                state.query = state.query.substring(0, state.query.length - 1);
            }
        } else if (key === "НАЙТИ") {
            loadMoviesFromServer(state.query);
            return;
        } else {
            state.query += key.toLowerCase();
        }
        renderKeyboard();
    }

    function loadMoviesFromServer(qStr) {
        var q = trimStr(qStr);
        byId("status").innerHTML = q ? ("Поиск: " + esc(q) + "...") : "Загрузка каталога...";
        xhrGet(WORKER_URL + "/search?q=" + encodeURIComponent(q), function (resp) {
            var data = null;
            try { data = JSON.parse(resp); } catch (e) {}
            var items = (data && data.items) ? data.items : [];
            state.movies = items;
            state.movIdx = 0;
            if (items.length > 0 && state.tab === 1) {
                state.zone = "mov_list";
            }
            byId("status").innerHTML = "Фильмов: " + items.length;
            renderMoviesList();
            updateFocus();
        }, function () {
            byId("status").innerHTML = "Ошибка поиска на сервере";
        });
    }

    function playMovieItem(item) {
        if (!item) { return; }
        byId("status").innerHTML = "Поиск рабочих потоков...";
        var req = WORKER_URL + "/resolve?title=" + encodeURIComponent(item.title || "");
        if (item.kpId) { req += "&kpId=" + encodeURIComponent(item.kpId); }
        if (item.archiveId) { req += "&archiveId=" + encodeURIComponent(item.archiveId); }

        xhrGet(req, function (resp) {
            var data = null;
            try { data = JSON.parse(resp); } catch (e) {}
            var streams = (data && data.streams) ? data.streams : [];
            if (streams.length === 0) {
                byId("status").innerHTML = "Поток не найден (защита правообладателя)";
                byId("mov-preview").innerHTML = "<b>" + esc(item.title) + "</b><br><br>К сожалению, открытых потоков без DRM для этого фильма сейчас нет. Попробуйте другой фильм.";
                return;
            }
            byId("status").innerHTML = "Запуск: " + esc(streams[0].name);
            startPlayer(streams[0].url, item.title + " [" + streams[0].name + "]");
        }, function () {
            byId("status").innerHTML = "Ошибка сервера при получении потока";
        });
    }

    function switchTab(t) {
        state.tab = t;
        removeClass(byId("tab-0"), "tab-active");
        removeClass(byId("tab-1"), "tab-active");
        addClass(byId("tab-" + t), "tab-active");

        removeClass(byId("panel-0"), "panel-vis");
        removeClass(byId("panel-1"), "panel-vis");
        addClass(byId("panel-" + t), "panel-vis");
        updateFocus();
    }

    function scrollInto(vpId, el) {
        var vp = byId(vpId);
        if (!vp || !el) { return; }
        var top = el.offsetTop;
        var bot = top + el.offsetHeight + 16;
        if (top < vp.scrollTop) { vp.scrollTop = top - 12; }
        else if (bot > vp.scrollTop + vp.clientHeight) { vp.scrollTop = bot - vp.clientHeight; }
    }

    function updateFocus() {
        var i;
        removeClass(byId("tab-0"), "focused");
        removeClass(byId("tab-1"), "focused");
        removeClass(byId("search-box"), "focused");
        removeClass(byId("btn-search"), "focused");
        removeClass(byId("btn-reset"), "focused");
        for (i = 0; i < 120; i++) { removeClass(byId("tv-card-" + i), "focused"); }
        for (i = 0; i < state.movies.length; i++) { removeClass(byId("mov-item-" + i), "focused"); }
        renderKeyboard();

        if (state.zone === "tabs") {
            addClass(byId("tab-" + state.tab), "focused");
            return;
        }
        if (state.tab === 0) {
            var tc = byId("tv-card-" + state.tvIdx);
            if (tc) {
                addClass(tc, "focused");
                scrollInto("panel-0", tc);
            }
        } else {
            if (state.zone === "mov_bar") {
                var ids = ["search-box", "btn-search", "btn-reset"];
                addClass(byId(ids[state.movBarIdx]), "focused");
            } else if (state.zone === "mov_list") {
                var mi = byId("mov-item-" + state.movIdx);
                if (mi) {
                    addClass(mi, "focused");
                    scrollInto("mov-viewport", mi);
                    updateMoviePreview();
                }
            }
        }
    }

    function showOsd(title, text, keepOpen) {
        byId("osd-title").innerHTML = esc(title);
        byId("osd-state").innerHTML = esc(text);
        byId("osd").style.display = "block";
        if (osdTimer) { clearTimeout(osdTimer); osdTimer = null; }
        if (!keepOpen) {
            osdTimer = setTimeout(function () { byId("osd").style.display = "none"; }, 4000);
        }
    }

    function destroyPlayer() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        var obj = byId("lg-av");
        if (obj) { try { if (typeof obj.stop === "function") { obj.stop(); } } catch (e) {} }
        byId("player-holder").innerHTML = "";
    }

    function startPlayer(playUrl, title) {
        state.inPlayer = true;
        destroyPlayer();
        byId("player-screen").style.display = "block";
        showOsd(title, "Подключение через сервер...", true);

        byId("player-holder").innerHTML = '<object id="lg-av" type="application/x-netcast-av" ' +
            'data="' + esc(playUrl) + '" width="1280" height="720" autoStart="true"></object>';

        setTimeout(function () {
            var obj = byId("lg-av");
            if (obj) { try { if (typeof obj.play === "function") { obj.play(1); } } catch (e) {} }
        }, 250);

        var playedOnce = false;
        var ticks = 0;
        pollTimer = setInterval(function () {
            var obj = byId("lg-av");
            if (!obj) { return; }
            ticks++;
            var ps = obj.playState;
            if (ps === 1) {
                if (!playedOnce) {
                    playedOnce = true;
                    showOsd(title, "Воспроизведение HD | CH+/CH- — каналы | BACK — выход", false);
                }
            } else if (ps === 3 || ps === 4) {
                showOsd(title, "Буферизация потока...", true);
            } else if (ps === 6 || (ticks > 15 && !playedOnce)) {
                showOsd(title, "Источник недоступен. Нажмите CH+/CH- или BACK.", true);
                clearInterval(pollTimer);
                pollTimer = null;
            }
        }, 1000);
    }

    function stopPlayer() {
        if (osdTimer) { clearTimeout(osdTimer); osdTimer = null; }
        destroyPlayer();
        state.inPlayer = false;
        byId("osd").style.display = "none";
        byId("player-screen").style.display = "none";
        updateFocus();
    }

    document.onkeydown = function (e) {
        var evt = e || window.event;
        var key = evt.keyCode || evt.which;

        if (state.inPlayer) {
            if (key === 461 || key === 8 || key === 27) {
                stopPlayer();
            } else if (key === 13) {
                showOsd("Плеер", "CH+/CH- — каналы | BACK — выход", false);
            } else if ((key === 427 || key === 33) && state.tab === 0 && state.tv.length > 1) {
                state.tvIdx = (state.tvIdx + 1) % state.tv.length;
                startPlayer(state.tv[state.tvIdx].url, (state.tvIdx + 1) + ". " + state.tv[state.tvIdx].name);
            } else if ((key === 428 || key === 34) && state.tab === 0 && state.tv.length > 1) {
                state.tvIdx = (state.tvIdx - 1 + state.tv.length) % state.tv.length;
                startPlayer(state.tv[state.tvIdx].url, (state.tvIdx + 1) + ". " + state.tv[state.tvIdx].name);
            }
            if (evt.preventDefault) { evt.preventDefault(); }
            return false;
        }

        if (state.tab === 1 && state.zone === "vkb") {
            var rows = keyboards[state.vkbLang];
            if (key === 37) {
                if (state.vkbCol > 0) { state.vkbCol--; }
                else { state.zone = "mov_list"; }
            } else if (key === 39) {
                if (state.vkbCol < rows[state.vkbRow].length - 1) { state.vkbCol++; }
            } else if (key === 38) {
                if (state.vkbRow > 0) {
                    state.vkbRow--;
                    if (state.vkbCol >= rows[state.vkbRow].length) { state.vkbCol = rows[state.vkbRow].length - 1; }
                } else { state.zone = "mov_bar"; }
            } else if (key === 40) {
                if (state.vkbRow < rows.length - 1) {
                    state.vkbRow++;
                    if (state.vkbCol >= rows[state.vkbRow].length) { state.vkbCol = rows[state.vkbRow].length - 1; }
                }
            } else if (key === 13) { pressVkb(); }
            else if (key === 461 || key === 8) { state.zone = "mov_list"; }
            updateFocus();
            if (evt.preventDefault) { evt.preventDefault(); }
            return false;
        }

        if (state.zone === "tabs") {
            if (key === 37 || key === 39) {
                switchTab(state.tab === 0 ? 1 : 0);
            } else if (key === 40 || key === 13) {
                state.zone = state.tab === 0 ? "tv_grid" : "mov_bar";
            }
        } else if (state.tab === 0) {
            var maxTv = (state.tv.length > 120 ? 120 : state.tv.length) - 1;
            if (key === 37 && state.tvIdx > 0) { state.tvIdx--; }
            else if (key === 39 && state.tvIdx < maxTv) { state.tvIdx++; }
            else if (key === 38) {
                if (state.tvIdx >= COLS) { state.tvIdx -= COLS; }
                else { state.zone = "tabs"; }
            } else if (key === 40) {
                if (state.tvIdx + COLS <= maxTv) { state.tvIdx += COLS; }
                else if (maxTv >= 0) { state.tvIdx = maxTv; }
            } else if (key === 13 && state.tv.length > 0) {
                startPlayer(state.tv[state.tvIdx].url, (state.tvIdx + 1) + ". " + state.tv[state.tvIdx].name);
                if (evt.preventDefault) { evt.preventDefault(); }
                return false;
            } else if (key === 461 || key === 8) { state.zone = "tabs"; }
        } else {
            if (state.zone === "mov_bar") {
                if (key === 37 && state.movBarIdx > 0) { state.movBarIdx--; }
                else if (key === 39 && state.movBarIdx < 2) { state.movBarIdx++; }
                else if (key === 38) { state.zone = "tabs"; }
                else if (key === 40) { state.zone = "mov_list"; }
                else if (key === 13) {
                    if (state.movBarIdx === 0) {
                        state.zone = "vkb";
                        state.vkbRow = 1;
                        state.vkbCol = 0;
                    } else if (state.movBarIdx === 1) {
                        loadMoviesFromServer(state.query);
                    } else {
                        state.query = "";
                        loadMoviesFromServer("");
                    }
                } else if (key === 461 || key === 8) { state.zone = "tabs"; }
            } else if (state.zone === "mov_list") {
                if (key === 38) {
                    if (state.movIdx > 0) { state.movIdx--; }
                    else { state.zone = "mov_bar"; }
                } else if (key === 40 && state.movIdx < state.movies.length - 1) {
                    state.movIdx++;
                } else if (key === 39) {
                    state.zone = "vkb";
                } else if (key === 13) {
                    playMovieItem(state.movies[state.movIdx]);
                } else if (key === 461 || key === 8) { state.zone = "tabs"; }
            }
        }

        updateFocus();
        if (evt.preventDefault) { evt.preventDefault(); }
        return false;
    };

    window.onload = function () {
        // 1. Загружаем живые HD-каналы с сервера + объединяем с локальным playlist.m3u
        xhrGet(WORKER_URL + "/tv", function (resp) {
            var data = null;
            try { data = JSON.parse(resp); } catch (e) {}
            var srvChannels = (data && data.channels) ? data.channels : [];
            xhrGet("playlist.m3u", function (txt) {
                state.tv = srvChannels.concat(parseM3U(txt));
                renderTvGrid();
                updateFocus();
            }, function () {
                state.tv = srvChannels;
                renderTvGrid();
                updateFocus();
            });
            byId("status").innerHTML = "Сервер: OK • HD-каналов: " + srvChannels.length;
        }, function () {
            byId("status").innerHTML = "Сервер недоступен";
            xhrGet("playlist.m3u", function (txt) {
                state.tv = parseM3U(txt);
                renderTvGrid();
                updateFocus();
            });
        });

        // 2. Загружаем витрину популярных фильмов
        loadMoviesFromServer("");
    };
})();
</script>
</body>
</html>
