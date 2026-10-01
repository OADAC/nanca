/* Nanca · v20 */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const fmt = (v, d = 2) => v.toFixed(d).replace(".", ",");
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.append(e); return e; };
  const NAMES = { basic: "Basic", line: "Line", natura: "Natura", myway: "My Way" };
  const LAV = { top: "#a9b4fb", left: "#7688f7", right: "#4d5ad6", edge: "rgba(20,22,70,.55)" };
  document.documentElement.classList.add("js");
  const visibleLoop = (node, frame) => {   // rAF solo mientras el elemento está en pantalla
    let on = false, raf = 0, last = 0;
    const f = (now) => { const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; frame(dt, now); raf = on ? requestAnimationFrame(f) : 0; };
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !raf) { last = 0; raf = requestAnimationFrame(f); } }).observe(node);
  };

  /* =========================================================
     Cabecera, carril, índice
     ========================================================= */
  const top = $(".top"), rail = $(".rail"), sheetN = $(".ts-n"), sheetT = $(".ts-t");
  const sheets = $$("[data-sheet]"), railLinks = $$(".rail a");
  const lights = $$(".system, .col-head, .fam-strip, .fam:not(.fam-dark), .draw, .circ > .scrolly, .ods-band");
  const isLightAt = (y) => lights.some((e) => { const r = e.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
  let lastY = scrollY, curSheet = "";
  const onScroll = () => {
    const y = scrollY, locked = document.body.classList.contains("lock");
    top.classList.toggle("on-light", !locked && isLightAt(34));
    rail?.classList.toggle("on-light", isLightAt(innerHeight / 2));
    if (y > innerHeight * .9 && y > lastY + 3 && !locked) top.classList.add("hide");
    else if (y < lastY - 3 || y < innerHeight * .9) top.classList.remove("hide");
    lastY = y;
    const mid = innerHeight * .4;
    const s = sheets.find((e) => { const r = e.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    if (s && s.dataset.sheet !== curSheet) {
      curSheet = s.dataset.sheet; sheetN.textContent = curSheet; sheetT.textContent = s.dataset.title;
      railLinks.forEach((a) => a.classList.toggle("on", a.querySelector("b").textContent === curSheet));
    }
  };
  let scrollQueued = false;
  const onScrollRaf = () => { if (scrollQueued) return; scrollQueued = true; requestAnimationFrame(() => { scrollQueued = false; onScroll(); }); };
  addEventListener("scroll", onScrollRaf, { passive: true }); addEventListener("resize", onScrollRaf); onScroll();

  const idx = $("#indice"), menuBtn = $(".btn-menu");
  const setMenu = (on) => {
    if (on) { idx.hidden = false; requestAnimationFrame(() => idx.classList.add("open")); }
    else { idx.classList.remove("open"); setTimeout(() => { if (!idx.classList.contains("open")) idx.hidden = true; }, 700); }
    document.body.classList.toggle("lock", on); menuBtn.setAttribute("aria-expanded", String(on)); menuBtn.textContent = on ? "Cerrar" : "Índice"; onScroll();
  };
  menuBtn.addEventListener("click", () => setMenu(!idx.classList.contains("open")));
  $$("a", idx).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && idx.classList.contains("open")) setMenu(false); });

  /* =========================================================
     Navegación: aparecer en la sección, sin recorrer la página
     ========================================================= */
  const veil = document.createElement("div"); veil.className = "veil"; veil.setAttribute("aria-hidden", "true"); document.body.append(veil);
  const jump = (el, hash) => {
    if (!el) return;
    const go = () => {
      const y = el.getBoundingClientRect().top + scrollY;
      scrollTo({ top: Math.max(0, y), behavior: "instant" });
      if (hash) history.replaceState(null, "", hash === "#inicio" ? location.pathname + location.search : hash);
      requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("jumping")));
    };
    if (reduce) { go(); return; }
    document.body.classList.add("jumping");
    setTimeout(go, 260);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented) return;
    const h = a.getAttribute("href"); if (h.length < 2) return;
    const el = document.getElementById(h.slice(1)); if (!el) return;
    e.preventDefault(); jump(el, h);
  });

  /* =========================================================
     Aparición
     ========================================================= */
  const RS = [".hx-scene", ".hx-device", ".hx-tabs", ".sec-head > *", ".col-head > *", ".sheet-main > *", ".sheet-side > *", ".lg", ".gal-row", ".mats header > *", ".mat-grid li", ".draw-wrap > *", ".film", ".sys-facts article", ".ods-band header > *", ".ods-band li", ".close-copy > *", ".lead"].join(",");
  $$(RS).forEach((n) => { if (n.parentElement.closest("[data-r]")) return; n.setAttribute("data-r", ""); const sib = [...n.parentElement.children].filter((c) => c.matches(RS)); n.style.setProperty("--d", `${Math.min(sib.indexOf(n), 5) * 70}ms`); });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .01, rootMargin: "0px 0px 8% 0px" });
  $$("[data-r], .fam-cover").forEach((n) => io.observe(n));
  $$("[data-tiles]").forEach((fig) => {
    const t = document.createElement("div"); t.className = "tiles"; t.setAttribute("aria-hidden", "true");
    for (let y = 0; y < 5; y++) for (let x = 0; x < 8; x++) { const i = document.createElement("i"); i.style.setProperty("--k", Math.round((x + y * 1.2) * 55 + Math.random() * 160)); t.append(i); }
    fig.append(t);
  });

  /* =========================================================
     01 · portada: fotos con luz + cursor de medida (solo aquí)
     ========================================================= */
  const hero = $(".hero");
  if (hero) {
    // retícula de 75 cm alrededor del cursor, con lectura de coordenadas
    const CS = 48, hc = document.createElement("i"); hc.className = "hc"; $(".hero-cross", hero).append(hc);
    const rc = $(".hr-c", hero), rm = $(".hr-m", hero);
    hero.style.setProperty("--cs", `${CS}px`);
    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || e.target.closest(".hero-copy a, .hero-copy button, .hero-foot")) { hero.classList.remove("aim"); return; }
      const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, i = Math.floor(x / CS), j = Math.floor(y / CS);
      hero.classList.add("aim");
      hero.style.setProperty("--mx", `${x}px`); hero.style.setProperty("--my", `${y}px`);
      hero.style.setProperty("--cx", `${(i + .5) * CS}px`); hero.style.setProperty("--cy", `${(j + .5) * CS}px`);
      hc.style.transform = `translate(${i * CS}px, ${j * CS}px)`;
      rc.textContent = `X ${String(i).padStart(2, "0")} · Y ${String(j).padStart(2, "0")}`;
      rm.textContent = `${fmt(i * .75)} · ${fmt(j * .75)} m`;
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("aim"));
  }

  /* =========================================================
     Motor isométrico (celdas que se encienden, suben y caen)
     ========================================================= */
  function Iso(cv, o) {
    const nx = o.nx, ny = o.ny, N = nx * ny;
    const H = new Float32Array(N), A = new Float32Array(N), Z = new Float32Array(N), T = new Float32Array(N), TH = new Float32Array(N), TA = new Float32Array(N), TZ = new Float32Array(N), TT = new Float32Array(N);
    const order = [...Array(N).keys()].sort((a, b) => ((a % nx) + ((a / nx) | 0)) - ((b % nx) + ((b / nx) | 0)));
    const g = cv.getContext("2d"), c30 = Math.cos(Math.PI / 6), s30 = .5;
    const view = { cx: nx / 2, cy: ny / 2, span: Math.max(nx, ny), tcx: nx / 2, tcy: ny / 2, tspan: Math.max(nx, ny) };
    let w = 0, h = 0, d = 1, labels = [], ghosts = [], clock = 0;
    const size = () => { const r = cv.getBoundingClientRect(); d = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height; cv.width = Math.round(w * d); cv.height = Math.round(h * d); };
    new ResizeObserver(size).observe(cv); size();
    const api = {
      N, nx, ny, view,
      clear() { TA.fill(0); TH.fill(0); TZ.fill(0); TT.fill(0); },
      set(x, y, a = 1, hh = 0, z = 0, tint = 0) { if (x < 0 || y < 0 || x >= nx || y >= ny) return; const k = y * nx + x; TA[k] = a; TH[k] = hh; TZ[k] = z; TT[k] = tint; },
      snap() { H.set(TH); A.set(TA); Z.set(TZ); T.set(TT); view.cx = view.tcx; view.cy = view.tcy; view.span = view.tspan; },
      look(cx, cy, span) { view.tcx = cx; view.tcy = cy; view.tspan = span; },
      labels(l) { labels = l; },
      ghosts(gl) { ghosts = gl; },
      frame(dt) {
        clock += dt;
        const k = 1 - Math.exp(-dt * (o.speed || 7)), kv = 1 - Math.exp(-dt * 3.2);
        for (let i = 0; i < N; i++) { H[i] += (TH[i] - H[i]) * k; A[i] += (TA[i] - A[i]) * k; Z[i] += (TZ[i] - Z[i]) * k * 1.2; T[i] += (TT[i] - T[i]) * k; }
        view.cx += (view.tcx - view.cx) * kv; view.cy += (view.tcy - view.cy) * kv; view.span += (view.tspan - view.span) * kv;
        draw();
      },
    };
    const mix = (a, b, t) => { const p = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16)); const A1 = p(a), B1 = p(b); return `rgb(${A1.map((v, i) => Math.round(v + (B1[i] - v) * t)).join(",")})`; };
    function draw() {
      g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h);
      if (!w) return;
      const zmax = o.zmax || 3.5, s = view.span;
      const kk = Math.min(w * .86 / (2 * c30 * s), h * .82 / (s + zmax * .8));
      const ox = w / 2, oy = h / 2 + zmax * kk * .32;
      const Q = (x, y, z) => [ox + ((x - view.cx) - (y - view.cy)) * c30 * kk, oy + ((x - view.cx) + (y - view.cy)) * s30 * kk - z * kk];
      const poly = (pts, fill, stroke, lw = 1) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
      // plano y retícula
      poly([Q(0, 0, 0), Q(nx, 0, 0), Q(nx, ny, 0), Q(0, ny, 0)], o.plane);
      g.lineWidth = 1;
      for (let i = 0; i <= nx; i++) { const maj = o.major && i % o.major === 0; g.strokeStyle = maj ? o.gridMajor : o.grid; g.beginPath(); g.moveTo(...Q(i, 0, 0)); g.lineTo(...Q(i, ny, 0)); g.stroke(); }
      for (let j = 0; j <= ny; j++) { const maj = o.major && j % o.major === 0; g.strokeStyle = maj ? o.gridMajor : o.grid; g.beginPath(); g.moveTo(...Q(0, j, 0)); g.lineTo(...Q(nx, j, 0)); g.stroke(); }
      // sombras arrojadas sobre el plano (luz desde arriba a la izquierda)
      if (o.shadow) {
        g.fillStyle = o.shadow;
        const hull = (pts) => { pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]); const lo = [], up = []; for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (const p of pts.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); };
        for (const i of order) {
          const a = A[i], hh = H[i] + Z[i]; if (a < .05 || hh < .1) continue;
          const x = i % nx, y = (i / nx) | 0, sx = hh * .55, sy = hh * .2;
          const pts = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]].flatMap(([u, v]) => [Q(u, v, 0), Q(u + sx, v + sy, 0)]);
          g.globalAlpha = Math.min(1, a) * (Z[i] > .2 ? .35 : 1); poly(hull(pts), g.fillStyle);
        }
        g.globalAlpha = 1;
      }
      // celdas
      for (const i of order) {
        const a = A[i]; if (a < .01) continue;
        const x = i % nx, y = (i / nx) | 0, z0 = Z[i], z1 = z0 + H[i], t = T[i];
        const top = t > .01 ? mix(o.top, o.tint, t) : o.top;
        g.globalAlpha = Math.min(1, a);
        const ins = .02;
        if (H[i] < .06 && z0 < .02) { poly([Q(x + ins, y + ins, 0), Q(x + 1 - ins, y + ins, 0), Q(x + 1 - ins, y + 1 - ins, 0), Q(x + ins, y + 1 - ins, 0)], top); continue; }
        poly([Q(x, y + 1, z0), Q(x + 1, y + 1, z0), Q(x + 1, y + 1, z1), Q(x, y + 1, z1)], o.left, o.edge, .8);
        poly([Q(x + 1, y, z0), Q(x + 1, y + 1, z0), Q(x + 1, y + 1, z1), Q(x + 1, y, z1)], o.right, o.edge, .8);
        poly([Q(x, y, z1), Q(x + 1, y, z1), Q(x + 1, y + 1, z1), Q(x, y + 1, z1)], top, o.edge, .8);
      }
      g.globalAlpha = 1;
      // módulos posibles: aristas discontinuas que laten
      if (ghosts.length) {
        g.setLineDash([4, 4]); g.lineDashOffset = -clock * 12; g.lineWidth = 1.4; g.strokeStyle = o.ghost || "#dff37a";
        for (const gh of ghosts) {
          const [x, y, hh] = gh, a = gh[3] ?? 1; if (a < .02) continue;
          g.globalAlpha = a * (.55 + .45 * Math.sin(clock * 3 + x + y));
          const e = (p, q) => { g.moveTo(...Q(...p)); g.lineTo(...Q(...q)); };
          g.beginPath();
          e([x, y, 0], [x + 1, y, 0]); e([x + 1, y, 0], [x + 1, y + 1, 0]); e([x + 1, y + 1, 0], [x, y + 1, 0]); e([x, y + 1, 0], [x, y, 0]);
          e([x, y, hh], [x + 1, y, hh]); e([x + 1, y, hh], [x + 1, y + 1, hh]); e([x + 1, y + 1, hh], [x, y + 1, hh]); e([x, y + 1, hh], [x, y, hh]);
          e([x + 1, y, 0], [x + 1, y, hh]); e([x + 1, y + 1, 0], [x + 1, y + 1, hh]); e([x, y + 1, 0], [x, y + 1, hh]);
          g.stroke();
          g.fillStyle = o.ghost || "#dff37a"; g.globalAlpha *= .12; poly([Q(x, y, hh), Q(x + 1, y, hh), Q(x + 1, y + 1, hh), Q(x, y + 1, hh)], g.fillStyle);
        }
        g.setLineDash([]); g.globalAlpha = 1;
      }
      // etiquetas de cota
      g.font = `600 ${Math.round(clamp(w / 48, 11, 14))}px Manrope, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
      for (const L of labels) {
        const [px, py] = Q(L.x, L.y, L.z || 0), tw = g.measureText(L.t).width + 18, th = 26;
        g.globalAlpha = L.a ?? 1;
        g.fillStyle = L.bg || "#0c0d0a"; g.beginPath(); g.roundRect(px - tw / 2, py - th / 2, tw, th, 13); g.fill();
        g.fillStyle = L.fg || "#f6f5e8"; g.fillText(L.t, px, py + 1);
      }
      g.globalAlpha = 1;
    }
    return api;
  }

  /* =========================================================
     02 · cómo funciona: celda → módulo → pieza → cuatro lógicas
     ========================================================= */
  const LOGIC = {   // en módulos de 3 × 3 m: [x, y, altura en módulos]
    basic: [[1, 1, 1], [2, 1, 1], [1, 2, 1], [2, 2, 1]],
    line: [[0, 1, 1], [1, 1, 1], [2, 1, .35], [3, 1, 1]],
    natura: [[0, 0, 1], [1, 0, 2], [2, 0, 2], [0, 1, 1], [2, 1, 1], [0, 2, 1], [1, 2, 1], [2, 2, 1], [1, 1, 0]],
    myway: [[0, 0, 1.5], [1, 0, 1.5], [0, 1, 1], [2, 2, 1], [3, 2, 1], [3, 3, .5]],
  };
  const sysCv = $(".sys-cv");
  let sysStep = 0, sysT = 0;
  if (sysCv) {
    const iso = Iso(sysCv, { speed: 4.2, nx: 16, ny: 16, major: 4, plane: "#f6f5e8", grid: "rgba(12,13,10,.08)", gridMajor: "rgba(12,13,10,.22)", top: LAV.top, left: LAV.left, right: LAV.right, edge: LAV.edge, tint: "#dff37a", zmax: 6, shadow: "rgba(59,67,176,.13)" });
    const cap = $(".sys-cap");
    const CAPS = ["Celda · 75 × 75 cm", "Módulo · 16 celdas · 3 × 3 m", "Pieza · del taller a tu parcela", ""];
    const MH = 3.6;   // 3 m de altura ≈ 4 celdas
    const mod = (mx, my, a, hh, z = 0, tint = 0) => { for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) iso.set(mx * 4 + i, my * 4 + j, a, hh, z, tint); };
    const ORD = [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [1, 1], [2, 1], [2, 2], [1, 2]];
    const stage = (k, t) => {
      iso.clear(); let L = [];
      if (k === 0) {
        iso.look(8, 8, 3.2);
        const p = reduce ? 1 : .5 + .5 * Math.sin(t * 3);
        iso.set(7, 7, 1, .04 + p * .12, 0, 0);
        L = [{ x: 7.5, y: 8.35, t: "75 cm", a: smooth(.3, .8, t) }, { x: 8.35, y: 7.5, t: "75 cm", a: smooth(.5, 1, t) }];
      } else if (k === 1) {
        iso.look(8, 8, 6.4);
        ORD.forEach(([i, j], n) => { if (reduce || t > .1 + n * .09) iso.set(6 + i, 6 + j, 1, .05, 0, n === 0 ? 1 : 0); });
        const a = smooth(1.6, 2, t);
        L = [{ x: 8, y: 10.4, t: "3 m", a }, { x: 10.4, y: 8, t: "3 m", a }, { x: 8, y: 8, z: .3, t: "≈ 9 m²", a, bg: "#7688f7" }];
      } else if (k === 2) {
        iso.look(8, 8, 12.5);
        const mods = [[1, 1], [0, 1], [2, 1], [1, 2], [1, 0]];
        mods.forEach(([mx, my], n) => { const st = .2 + n * .45; if (reduce || t > st) mod(mx, my, 1, MH, 0, 0); else mod(mx, my, 0, MH, 7); });
        L = [{ x: 8, y: 8, z: MH + 1.2, t: "5–7 meses*", a: smooth(2.3, 2.7, t), bg: "#dff37a", fg: "#0c0d0a" }];
      } else {
        iso.look(8, 8, 16.5);
        const keys = Object.keys(LOGIC), cyc = 3.8, n = reduce ? 0 : Math.floor(t / cyc) % 4, tl = t % cyc, key = keys[n];
        LOGIC[key].forEach(([mx, my, hm], q) => {
          const on = reduce || tl > q * .13;
          if (hm === 0) mod(mx, my, on ? .9 : 0, 0, 0, 1);   // patio
          else mod(mx, my, on ? 1 : 0, on ? hm * MH : 0, 0, 0);
        });
        if (cap) { const tx = `${NAMES[key]} · ${{ basic: "suma módulos", line: "los alinea", natura: "los ordena alrededor de un patio", myway: "los combina con libertad" }[key]}`; if (cap.textContent !== tx) cap.textContent = tx; }
        L = [];
      }
      if (k < 3 && cap && cap.textContent !== CAPS[k]) cap.textContent = CAPS[k];
      iso.labels(L);
    };
    stage(0, 1); iso.snap();
    visibleLoop(sysCv, (dt) => { sysT += dt; stage(sysStep, sysT); iso.frame(dt); });
  }

  /* 04 · comparar: cada lógica se construye pieza a pieza y deja ver hacia dónde puede crecer */
  const LG = {   // [x, y, altura] en módulos sobre 5 × 5 · altura 0 = patio · g = crecimiento posible
    basic: { m: [[1, 2, 1], [2, 2, 1], [1, 3, 1], [2, 3, 1]], g: [[3, 2, 1], [3, 3, 1]] },
    line: { m: [[0, 2, 1], [1, 2, 1], [2, 2, .3], [3, 2, 1]], g: [[4, 2, 1]] },
    natura: { m: [[1, 1, 1], [2, 1, 2], [3, 1, 2], [1, 2, 1], [3, 2, 1], [1, 3, 1], [2, 3, 1], [3, 3, 1], [2, 2, 0]], g: [[1, 1, 2], [1, 2, 2]] },
    myway: { m: [[0, 1, 1.5], [1, 1, 1.5], [0, 2, 1], [3, 3, 1], [4, 3, 1], [4, 4, .45]], g: [[1, 2, 1], [2, 3, .45]] },
  };
  $$(".lg").forEach((card, ci) => {
    const cv = $(".lg-cv", card), key = card.dataset.logic, L = LG[key]; if (!cv || !L) return;
    const iso = Iso(cv, { nx: 5, ny: 5, major: 1, plane: "rgba(246,245,232,.05)", grid: "rgba(246,245,232,.08)", gridMajor: "rgba(246,245,232,.2)", top: "#e3e7ff", left: "#8b9af9", right: "#5563dc", edge: "rgba(20,22,70,.45)", tint: "#dff37a", zmax: 2.4, speed: 4, shadow: "rgba(10,12,60,.35)", ghost: "#dff37a" });
    iso.look(2.5, 2.5, 5.2);
    let t = -ci * .4, hover = false;
    card.addEventListener("pointerenter", () => { hover = true; });
    card.addEventListener("pointerleave", () => { hover = false; });
    const n = L.m.length, build = n * .62, cycle = build + 5.5;
    visibleLoop(cv, (dt) => {
      t += dt * (hover ? 1.25 : 1); const tt = reduce ? 99 : t % cycle;
      iso.clear();
      L.m.forEach(([x, y, hm], q) => { const st = q * .62, on = tt > st, fresh = on && tt < st + .8; if (hm === 0) iso.set(x, y, on ? .95 : 0, 0, 0, 1); else iso.set(x, y, on ? 1 : 0, hm * .9, on ? 0 : 3, fresh ? 1 : 0); });
      const ga = reduce ? 1 : smooth(build + .3, build + 1.3, tt) * (1 - smooth(cycle - .9, cycle, tt));
      iso.ghosts(L.g.map(([x, y, hm]) => [x, y, hm * .9, ga]));
      iso.frame(dt);
    });
  });

  const pre = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; pre.unobserve(e.target); $$("img", e.target).forEach((im) => { im.loading = "eager"; im.decode?.().catch(() => {}); }); }), { rootMargin: "120% 0px 120% 0px" });
  $$(".fam, .fam-strip, .spaces, .tech").forEach((n) => pre.observe(n));

  /* =========================================================
     Fichas de modelo: plantas por niveles
     ========================================================= */
  $$(".plan-box").forEach((box) => {
    const tabs = $$("[data-plan]", box), imgs = $$(".plan-img img", box);
    tabs.forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.plan; tabs.forEach((x) => x.setAttribute("aria-selected", String(x === b))); imgs.forEach((im, k) => im.classList.toggle("on", k === i)); }));
  });

  /* =========================================================
     05 · la materia: lectura y muestra (el 3D vive en nanca-mats3d.js)
     ========================================================= */
  const MATINFO = {   // lectura cualitativa y orientativa (1-5)
    hormigon: [["Inercia térmica", 5], ["Ligereza", 1], ["Desmontaje", 2]],
    acero: [["Inercia térmica", 1], ["Ligereza", 4], ["Desmontaje", 5]],
    madera: [["Inercia térmica", 3], ["Ligereza", 5], ["Desmontaje", 4]],
    reciclado: [["Inercia térmica", 2], ["Ligereza", 4], ["Desmontaje", 5]],
  };
  $$(".mat-grid li").forEach((li) => {
    const m = li.dataset.mat, info = MATINFO[m], box = $(".struct", li); if (!info) return;
    box?.style.setProperty("--tex", `url(assets/v20/mat-${m}.webp)`);
    const ul = document.createElement("ul"); ul.className = "meters";
    ul.innerHTML = info.map(([k, v]) => `<li><span>${k}</span><i style="--v:${v}"></i></li>`).join("");
    li.append(ul);
    const chip = document.createElement("span"); chip.className = "mat-chip"; chip.style.backgroundImage = `url(assets/v20/mat-${m}.webp)`; $("strong", li)?.prepend(chip);
  });

  /* =========================================================
     08 · casa conectada: la casa en planos, el procesador en el centro y los datos en movimiento
     ========================================================= */
  const hx = $(".hxw");
  if (hx) {
    const home = $(".home"), cv = $(".hx-cv", hx), g0 = cv.getContext("2d"), tabs = $$(".hx-tabs [data-n]", home), screens = $$(".hx-s", hx);
    const W = 16, D = 10, HH = 4, CORE = [8, 5];
    const PATHS = {   // pistas ortogonales sobre el suelo y subida hasta cada punto
      1: { pts: [[8, 5, 0], [8, 2.5, 0], [3, 2.5, 0], [3, 2.5, 2.1]], label: "Libro digital" },
      2: { pts: [[8, 5, 0], [13, 5, 0], [13, 2.5, 0], [13, 2.5, 3.3]], label: "Domótica" },
      3: { pts: [[8, 5, 0], [11.5, 5, 0], [11.5, 8, 0], [11.5, 8, 6.2]], label: "Cobertura propia" },
      4: { pts: [[8, 5, 0], [8, 7.5, 0], [1.2, 7.5, 0], [1.2, 7.5, 2.3]], label: "Pantallas" },
    };
    const ICON = {
      1: "M-7-7h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3h-6Zm16 0h-6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h6Z",
      2: "M0-8a6 6 0 0 1 4 10.5V6h-8V2.5A6 6 0 0 1 0-8Zm-3 17h6",
      3: "M0-2v11M-5-6a7 7 0 0 1 10 0M-9-10a12 12 0 0 1 18 0",
      4: "M-9-7h18v11h-18Zm5 15h8M0 4v4",
    };
    for (const n in PATHS) { const pts = PATHS[n].pts; let L = 0; PATHS[n].seg = pts.slice(1).map((q, i) => { const p0 = pts[i], l = Math.hypot(q[0] - p0[0], q[1] - p0[1], q[2] - p0[2]); L += l; return l; }); PATHS[n].len = L; }
    const along = (P, t) => { let d = t * P.len; for (let i = 0; i < P.seg.length; i++) { if (d <= P.seg[i]) { const a = P.pts[i], b = P.pts[i + 1], f = d / P.seg[i]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; } d -= P.seg[i]; } return P.pts[P.pts.length - 1]; };
    let g = g0, back = null, front = null;
    let w = 0, h = 0, dpr = 1, k = 1, ox = 0, oy = 0, act = 1, mx = 0, my = 0, pmx = 0, pmy = 0, clock = 0;
    const c30 = Math.cos(Math.PI / 6);
    const size = () => {
      const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr;
      k = Math.min(w / ((W + D) * c30 * 1.0), h / ((W + D) * .5 + HH + 3));
      ox = w / 2 - (W - D) / 2 * c30 * k; oy = h / 2 - ((W + D) * .25) * k + (HH + 1.5) * k * .5;
      queueMicrotask(cache);   // las funciones de dibujo se definen justo después
    };
    function cache() {   // capas fijas: se pintan solo al cambiar de tamaño
      if (!w) return;
      const mk = () => { const c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height; const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, x]; };
      const spx = pmx, spy = pmy; pmx = pmy = 0;
      let x; [back, x] = mk(); g = x;
      for (let i = -5; i <= W + 5; i++) line([[i, -5, 0], [i, D + 5, 0]], `rgba(169,180,251,${i < 0 || i > W ? .05 : .13})`);
      for (let j = -5; j <= D + 5; j++) line([[-5, j, 0], [W + 5, j, 0]], `rgba(169,180,251,${j < 0 || j > D ? .05 : .13})`);
      poly([[0, 0, 0], [W, 0, 0], [W, 0, HH], [0, 0, HH]], "rgba(118,136,247,.10)", "rgba(169,180,251,.45)");
      poly([[0, 0, 0], [0, D, 0], [0, D, HH], [0, 0, HH]], "rgba(118,136,247,.16)", "rgba(169,180,251,.45)");
      for (const [x0, x1] of [[2, 5], [9, 14]]) poly([[x0, 0, 1], [x1, 0, 1], [x1, 0, 3.2], [x0, 0, 3.2]], "rgba(223,243,122,.05)", "rgba(169,180,251,.35)");
      line([[6, 0, 0], [6, 4, 0], [6, 4, 3]], "rgba(169,180,251,.25)"); line([[10, D, 0], [10, 6.5, 0], [16, 6.5, 0]], "rgba(169,180,251,.25)");
      [front, x] = mk(); g = x;
      poly([[0, 0, HH], [W, 0, HH], [W, D, HH], [0, D, HH]], "rgba(118,136,247,.06)", "rgba(201,208,253,.7)", 1.4);
      line([[W, 0, 0], [W, 0, HH]], "rgba(201,208,253,.55)"); line([[W, D, 0], [W, D, HH]], "rgba(201,208,253,.55)"); line([[0, D, 0], [0, D, HH]], "rgba(201,208,253,.55)");
      line([[0, D, 0], [W, D, 0], [W, 0, 0]], "rgba(201,208,253,.55)", 1.2);
      g = g0; pmx = spx; pmy = spy;
    }
    const layer = (c) => { if (!c) return; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, Math.round(pmx * dpr), Math.round(pmy * dpr)); g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    new ResizeObserver(size).observe(cv); size();
    const Q = (x, y, z) => [ox + pmx + (x - y) * c30 * k, oy + pmy + (x + y) * .5 * k - z * k];
    const line = (pts, stroke, lw = 1) => { g.beginPath(); pts.forEach((p, i) => { const q = Q(...p); i ? g.lineTo(...q) : g.moveTo(...q); }); g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); };
    const poly = (pts, fill, stroke, lw = 1) => { g.beginPath(); pts.forEach((p, i) => { const q = Q(...p); i ? g.lineTo(...q) : g.moveTo(...q); }); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
    const draw = (dt) => {
      clock += dt; pmx += (mx - pmx) * .035; pmy += (my - pmy) * .035;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      layer(back);   // retícula y muros del fondo (fijos)
      // 04 · pantalla en la pared
      const on4 = act === 4;
      poly([[.02, 5.8, 1.1], [.02, 8.8, 1.1], [.02, 8.8, 2.9], [.02, 5.8, 2.9]], on4 ? "rgba(223,243,122,.28)" : "rgba(118,136,247,.25)", on4 ? "#dff37a" : "rgba(169,180,251,.7)", 1.4);
      for (let i = 0; i < 3; i++) line([[.03, 6.2, 2.5 - i * .4], [.03, 7.4 + i * .5, 2.5 - i * .4]], on4 ? "rgba(223,243,122,.85)" : "rgba(169,180,251,.5)", 2);
      // 02 · lámpara con su luz
      const on2 = act === 2;
      line([[13, 2.5, HH], [13, 2.5, 3.3]], "rgba(169,180,251,.5)");
      if (on2) { const gl2 = g.createRadialGradient(...Q(13, 2.5, 0), 0, ...Q(13, 2.5, 0), k * 2.4); gl2.addColorStop(0, "rgba(223,243,122,.3)"); gl2.addColorStop(1, "rgba(223,243,122,0)"); g.fillStyle = gl2; poly([[11, .5, 0], [15, .5, 0], [15, 4.5, 0], [11, 4.5, 0]], gl2); }
      // 01 · libro digital: las capas del edificio flotan
      const on1 = act === 1;
      for (let i = 0; i < 4; i++) { const z = .6 + i * .32 + (on1 ? Math.sin(clock * 2 + i) * .06 + i * .14 : 0); poly([[1.8, 1.4, z], [4.2, 1.4, z], [4.2, 3.6, z], [1.8, 3.6, z]], on1 ? `rgba(223,243,122,${.16 + i * .06})` : "rgba(118,136,247,.14)", on1 ? "rgba(223,243,122,.8)" : "rgba(169,180,251,.5)"); }
      // pistas y pulsos de datos
      for (const n of [1, 2, 3, 4]) {
        const P = PATHS[n], on = n === act;
        line(P.pts, on ? "rgba(223,243,122,.9)" : "rgba(169,180,251,.35)", on ? 2.4 : 1.4);
        const count = on ? 5 : 2, sp = on ? .3 : .15;
        for (let i = 0; i < count; i++) {
          const t = (clock * sp + i / count + n * .13) % 1, [px, py] = Q(...along(P, t));
          if (on) { g.fillStyle = "rgba(223,243,122,.22)"; g.beginPath(); g.arc(px, py, 8, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = on ? "#dff37a" : "rgba(201,208,253,.8)"; g.beginPath(); g.arc(px, py, on ? 3.2 : 2, 0, Math.PI * 2); g.fill();
        }
      }
      layer(front);   // forjado de cubierta y aristas delanteras (fijos)
      // 03 · antena con ondas
      const [ax, ay] = Q(11.5, 8, 6.2), on3 = act === 3;
      for (let i = 0; i < 3; i++) { const r = ((clock * .7 + i / 3) % 1) * 46; g.strokeStyle = on3 ? `rgba(223,243,122,${1 - r / 46})` : `rgba(169,180,251,${(1 - r / 46) * .5})`; g.lineWidth = 1.5; g.beginPath(); g.arc(ax, ay, r, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
      // el procesador, en el centro de la casa
      const [cx, cy] = Q(CORE[0] + .5, CORE[1] + .5, .3), pulse = .5 + .5 * Math.sin(clock * 3);
      const gl = g.createRadialGradient(cx, cy, 0, cx, cy, k * 3.4); gl.addColorStop(0, `rgba(223,243,122,${.35 + pulse * .2})`); gl.addColorStop(1, "rgba(223,243,122,0)");
      g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, k * 3.4, 0, Math.PI * 2); g.fill();
      const c0 = CORE[0] - .2, c1 = CORE[0] + 1.2, d0 = CORE[1] - .2, d1 = CORE[1] + 1.2, zt = .45;
      poly([[c0, d1, 0], [c1, d1, 0], [c1, d1, zt], [c0, d1, zt]], "#5d6fe6"); poly([[c1, d0, 0], [c1, d1, 0], [c1, d1, zt], [c1, d0, zt]], "#3b43b0");
      poly([[c0, d0, zt], [c1, d0, zt], [c1, d1, zt], [c0, d1, zt]], "#dff37a", "#0c0d0a", 1);
      poly([[c0 + .4, d0 + .4, zt], [c1 - .4, d0 + .4, zt], [c1 - .4, d1 - .4, zt], [c0 + .4, d1 - .4, zt]], "#0c0d0a");
      // nodos: disco con icono y etiqueta
      for (const n of [1, 2, 3, 4]) {
        const P = PATHS[n], on = n === act, end = P.pts[P.pts.length - 1], bob = Math.sin(clock * 1.6 + n) * 3;
        const [nx, ny0] = Q(end[0], end[1], end[2] + .9), ny = ny0 + bob, r = on ? 21 : 17;
        g.fillStyle = on ? "#dff37a" : "#2f3694"; g.strokeStyle = on ? "#dff37a" : "rgba(169,180,251,.8)"; g.lineWidth = 1.6;
        g.beginPath(); g.arc(nx, ny, r, 0, Math.PI * 2); g.fill(); g.stroke();
        g.save(); g.translate(nx, ny); g.scale(on ? 1.05 : .85, on ? 1.05 : .85); g.strokeStyle = on ? "#0c0d0a" : "#eeeccd"; g.lineWidth = 1.8; g.lineCap = g.lineJoin = "round"; g.stroke(new Path2D(ICON[n])); g.restore();
        g.font = `${on ? 700 : 600} 12px Manrope, sans-serif`; g.textBaseline = "middle"; const tw = g.measureText(P.label).width;
        if (on) { g.fillStyle = "rgba(12,13,10,.85)"; g.beginPath(); g.roundRect(nx + r + 8, ny - 12, tw + 18, 24, 12); g.fill(); }
        g.fillStyle = on ? "#dff37a" : "rgba(238,236,205,.7)"; g.fillText(P.label, nx + r + (on ? 17 : 8), ny + 1);
      }
    };
    visibleLoop(cv, (dt) => draw(dt));
    hx.addEventListener("pointermove", (e) => { const r = hx.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width - .5) * -14; my = ((e.clientY - r.top) / r.height - .5) * -9; });
    hx.addEventListener("pointerleave", () => { mx = my = 0; });
    // pestañas con avance automático
    let t0 = performance.now(), paused = false, visible = false;
    const DUR = 7000;
    const set = (n) => { act = n; t0 = performance.now(); tabs.forEach((b) => { b.setAttribute("aria-selected", String(+b.dataset.n === n)); b.style.setProperty("--p", 0); }); screens.forEach((s) => s.classList.toggle("on", +s.dataset.n === n)); };
    tabs.forEach((b) => { b.addEventListener("click", () => set(+b.dataset.n)); b.addEventListener("pointerenter", () => { paused = true; }); b.addEventListener("pointerleave", () => { paused = false; t0 = performance.now() - (+b.style.getPropertyValue("--p") || 0) * DUR; }); });
    let traf = 0;
    const tick = (now) => {
      if (!paused && !reduce) { const p = (now - t0) / DUR; tabs[act - 1].style.setProperty("--p", Math.min(1, p).toFixed(3)); if (p >= 1) set(act % 4 + 1); }
      traf = visible ? requestAnimationFrame(tick) : 0;
    };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { t0 = performance.now(); if (!traf) traf = requestAnimationFrame(tick); } }, { threshold: .25 }).observe(hx);
    set(1);
    const clk = $(".hx-clock", hx); const upd = () => { const d = new Date(); clk.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }; upd(); setInterval(upd, 30000);
  }

  /* =========================================================
     Escenas con scroll: sistema, tecnología, ciclo de vida
     ========================================================= */
  const ICO = {
    measure: '<rect x="12" y="12" width="40" height="40"/><path d="M12 22h6M12 32h10M12 42h6M22 12v6M32 12v10M42 12v6"/>',
    reduce: '<path d="M10 16h44L38 34v14l-12 6V34Z"/>',
    live: '<path d="M12 30 32 14l20 16v22H12Z"/><circle cx="32" cy="38" r="6"/><path d="M32 26v4M32 46v4M20 38h4M40 38h4"/>',
    keep: '<rect x="16" y="10" width="32" height="44" rx="3"/><path d="M23 22h18M23 30h18M23 38h11"/>',
    loop: '<path d="M48 26a17 17 0 0 0-31-5M16 38a17 17 0 0 0 31 5"/><path d="M17 11v10h10M47 53V43H37"/>',
  };
  $$("[data-scrolly]").forEach((sc) => {
    const kind = sc.dataset.scrolly;
    const n = +getComputedStyle(sc).getPropertyValue("--n") || 5;
    const items = $$(".st-list > li", sc), num = $(".st-n", sc), dots = $$(".dots button", sc), imgs = $$(".tech-frame img", sc), frame = $(".tech-frame", sc);
    const ring = $(".ring", sc); let ico = $(".ring-ico", sc);
    let nodes = [];
    if (ring) {
      const g = $(".ring-nodes", ring);
      nodes = items.map((li, i) => {
        const a = -Math.PI / 2 + i / n * Math.PI * 2, x = 200 + Math.cos(a) * 160, y = 200 + Math.sin(a) * 160;
        const grp = el("g", {}, g); el("circle", { cx: x, cy: y, r: 17 }, grp); el("text", { x, y: y + 1, class: "n" }, grp).textContent = `0${i + 1}`;
        const ca = Math.cos(a), lx = 200 + ca * 194, ly = 200 + Math.sin(a) * 194 + (Math.sin(a) < -.9 ? -8 : Math.sin(a) > .5 ? 12 : 0);
        const t = el("text", { x: lx + (ca > .3 ? 8 : ca < -.3 ? -8 : 0), y: ly, class: "lbl", style: `text-anchor:${ca > .3 ? "start" : ca < -.3 ? "end" : "middle"}` }, grp); t.textContent = $("h3", li).textContent;
        grp.addEventListener("click", () => go(i)); return grp;
      });
    }
    let cur = -1;
    const set = (k) => {
      if (k === cur) return; cur = k;
      items.forEach((li, i) => li.classList.toggle("on", i === k));
      if (num) num.textContent = String(k + 1).padStart(2, "0");
      dots.forEach((d, i) => d.classList.toggle("on", i === k));
      imgs.forEach((im, i) => im.classList.toggle("on", i === k));
      if (frame?._bg) { const im = imgs[k]; frame._bg.style.backgroundImage = im && im.dataset.fit === "contain" ? `url(${im.currentSrc || im.src})` : "none"; }
      nodes.forEach((g, i) => { g.classList.toggle("on", i <= k); g.classList.toggle("cur", i === k); });
      if (ico) { const w = document.createElement("div"); w.innerHTML = `<svg class="ring-ico draw" viewBox="0 0 64 64" aria-hidden="true">${ICO[items[k].dataset.ico] || ""}</svg>`; const nw = w.firstElementChild; ico.replaceWith(nw); ico = nw; }
      if (kind === "sys") { sysStep = k; sysT = 0; }
    };
    if (frame) { const bg = document.createElement("i"); bg.className = "tf-bg"; frame.prepend(bg); frame._bg = bg; }
    const go = (k) => { const r = sc.getBoundingClientRect(), span = sc.offsetHeight - innerHeight; scrollTo({ top: scrollY + r.top + span * ((k + .5) / n), behavior: reduce ? "auto" : "smooth" }); };
    dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
    const upd = () => { const r = sc.getBoundingClientRect(), span = sc.offsetHeight - innerHeight; if (r.bottom < 0 || r.top > innerHeight) return;
      const pr = clamp(-r.top / span, 0, .999); set(clamp(Math.floor(pr * n), 0, n - 1));
      const cont = clamp((pr * n + .5) / n, 0, 1); frame?.style.setProperty("--sp", cont.toFixed(4)); ring?.style.setProperty("--rp", cont.toFixed(4)); };
    let q = false; addEventListener("scroll", () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; upd(); }); }, { passive: true }); set(0); upd();
  });
  const ch = $(".circ-hero");
  if (ch && !reduce) {
    const chImg = $("img", ch); let chQ = false;
    addEventListener("scroll", () => { if (chQ) return; chQ = true; requestAnimationFrame(() => { chQ = false; const r = ch.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; chImg.style.transform = `scale(${(1.12 - clamp(1 - r.top / innerHeight, 0, 1) * .12).toFixed(4)})`; }); }, { passive: true });
  }

  /* =========================================================
     Modelos 3D
     ========================================================= */
  const wv = $("#world"), frameW = $("#world iframe"), wload = $("#world .wv-load");
  const W3 = { key: null, studio: false, loaded: false };
  const url = (k, st) => `mundos/${k}/index.html?embed=1${st ? "&estudio=1" : ""}`;
  const pressed = () => {
    $$("[data-wv-model]", wv).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.wvModel === W3.key)));
    $$("[data-wv-mode]", wv).forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.wvMode === "studio") === W3.studio)));
    $("#wvTitle").textContent = NAMES[W3.key] || "";
    $(".wv-open", wv).href = `mundos/${W3.key}/index.html${W3.studio ? "?estudio=1" : ""}`;
  };
  const load = (k, st) => { W3.key = k; W3.studio = !!st; W3.loaded = false; pressed(); wload.classList.remove("done"); loaderAnim(true); frameW.src = url(k, W3.studio); };
  const setStudio = (on) => { W3.studio = on; pressed(); if (W3.loaded) frameW.contentWindow?.postMessage({ nanca: "studio", on, view: on ? "axo" : undefined }, "*"); else load(W3.key, on); };
  const openWorld = (k, st = false) => {
    if (!wv || !NAMES[k]) return;
    if (!wv.open) { wv.showModal(); document.body.classList.add("lock"); }
    if (W3.key !== k) load(k, st); else if (W3.studio !== st) setStudio(st);
  };
  frameW?.addEventListener("load", () => { if (!frameW.src || frameW.src.endsWith("about:blank")) return; W3.loaded = true; setTimeout(() => { wload.classList.add("done"); loaderAnim(false); }, 300); try { frameW.contentWindow.focus(); } catch (e) {} });
  wv?.addEventListener("close", () => { document.body.classList.remove("lock"); frameW.src = "about:blank"; W3.key = null; W3.loaded = false; loaderAnim(false); });
  $(".wv-close", wv)?.addEventListener("click", () => wv.close());
  $$("[data-wv-model]", wv).forEach((b) => b.addEventListener("click", () => load(b.dataset.wvModel, W3.studio)));
  $$("[data-wv-mode]", wv).forEach((b) => b.addEventListener("click", () => setStudio(b.dataset.wvMode === "studio")));
  document.addEventListener("click", (e) => { const t = e.target.closest("[data-open-world]"); if (!t || !t.dataset.openWorld) return; e.preventDefault(); openWorld(t.dataset.openWorld, t.hasAttribute("data-studio")); });
  const qm = location.search.match(/[?&]mundo=(basic|line|natura|myway)/);
  if (qm) setTimeout(() => openWorld(qm[1], /[?&]estudio=1/.test(location.search)), 900);
  const lc = $("canvas", wload); let lraf = 0;
  function loaderAnim(on) {
    cancelAnimationFrame(lraf); if (!on || !lc) return;
    const g = lc.getContext("2d"), d = Math.min(devicePixelRatio || 1, 2); lc.width = 180 * d; lc.height = 120 * d; g.setTransform(d, 0, 0, d, 0, 0);
    const shape = new Set(["1,4", "2,4", "3,4", "4,4", "5,4", "6,4", "7,4", "1,3", "2,3", "3,3", "4,3", "5,3", "6,3", "7,3", "2,2", "3,2", "4,2", "5,2", "6,2", "3,1", "4,1", "5,1", "4,0"]);
    const t0 = performance.now();
    const f = (now) => {
      const t = ((now - t0) / 1000) % 3.2; g.clearRect(0, 0, 180, 120);
      for (let y = 0; y < 5; y++) for (let x = 0; x < 9; x++) { const X = 9 + x * 18, Y = 12 + y * 20; g.strokeStyle = "rgba(236,235,228,.14)"; g.strokeRect(X + .5, Y + .5, 17, 19);
        if (shape.has(`${x},${y}`)) { const k = smooth(0, .25, t - ((4 - y) * .35 + Math.abs(x - 4) * .06)); if (k > 0) { g.fillStyle = `rgba(118,136,247,${k})`; g.fillRect(X + 2, Y + 2 + (1 - k) * 8, 14, 16 - (1 - k) * 8); } } }
      lraf = requestAnimationFrame(f);
    };
    lraf = requestAnimationFrame(f);
  }

  /* =========================================================
     Visor de imágenes
     ========================================================= */
  const lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $(".lb-cap", lb), lbN = $(".lb-count", lb);
  let LB = null; const groups = new Map();
  $$("[data-lb-group]").forEach((grp) => {
    const items = $$("figure", grp).map((f) => ({ img: $("img", f), cap: ($("figcaption", f)?.textContent || "").replace(/\s+/g, " ").trim() }));
    items.forEach((it, i) => { it.img.tabIndex = 0; it.img.setAttribute("role", "button"); it.img.setAttribute("aria-label", `Ampliar: ${it.cap || it.img.alt}`); groups.set(it.img, { items, i }); });
  });
  const showLb = () => { const it = LB.items[LB.i]; lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = ""; lbImg.src = it.img.currentSrc || it.img.src; lbImg.alt = it.img.alt; lbCap.textContent = it.cap; lbN.textContent = `${String(LB.i + 1).padStart(2, "0")} / ${String(LB.items.length).padStart(2, "0")}`; };
  const openLb = (img) => { const g = groups.get(img); if (!g) return; LB = { items: g.items, i: g.i }; showLb(); lb.showModal(); };
  const stepLb = (d) => { LB.i = (LB.i + d + LB.items.length) % LB.items.length; showLb(); };
  document.addEventListener("click", (e) => { const im = e.target.closest("img"); if (im && groups.has(im)) openLb(im); });
  document.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && groups.has(e.target)) { e.preventDefault(); openLb(e.target); } });
  $(".lb-prev", lb).addEventListener("click", () => stepLb(-1)); $(".lb-next", lb).addEventListener("click", () => stepLb(1)); $(".lb-close", lb).addEventListener("click", () => lb.close());
  lb.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") stepLb(1); if (e.key === "ArrowLeft") stepLb(-1); });
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  let tx = null; lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1); tx = null; });

  const toForm = (k) => {
    const r = $(`#lead input[name=modelo][value="${k || ""}"]`); if (r) r.checked = true;
    jump($("#contacto"), "#contacto");
    setTimeout(() => $("#lead input[name=nombre]").focus({ preventScroll: true }), 500);
  };

  /* =========================================================
     06 · dibuja tu casa
     ========================================================= */
  const drawing = { info: null, art: "" };
  const dcv = $(".draw-cv");
  if (dcv) {
    const COLS = 24, ROWS = 14, CM = .75, AREA = CM * CM;
    const G = new Uint8Array(COLS * ROWS), hist = [];
    const at = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS) ? 0 : G[y * COLS + x];
    const dctx = dcv.getContext("2d"), iso = $(".iso-cv"), ictx = iso.getContext("2d");
    let tool = 1, paint = null, lastCell = null, info = null;
    const rect = (x, y, w, h, v = 1) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i < COLS && j < ROWS) G[j * COLS + i] = v; };
    const PRESET = {
      basic: () => rect(9, 4, 8, 6),
      line: () => rect(2, 5, 20, 4),
      natura: () => { rect(7, 2, 10, 10); rect(10, 5, 4, 4, 0); },
      myway: () => { rect(2, 3, 8, 5); rect(2, 8, 4, 4); rect(13, 2, 6, 5); rect(15, 7, 4, 5); },
    };
    const snap = () => { hist.push(G.slice()); if (hist.length > 40) hist.shift(); };
    const analyse = () => {
      let n = 0, x0 = COLS, x1 = -1, y0 = ROWS, y1 = -1;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (at(x, y)) { n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      if (!n) return { n: 0 };
      const outside = new Uint8Array(COLS * ROWS), st = [];
      for (let x = 0; x < COLS; x++) st.push([x, 0], [x, ROWS - 1]); for (let y = 0; y < ROWS; y++) st.push([0, y], [COLS - 1, y]);
      while (st.length) { const [x, y] = st.pop(); if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue; const k = y * COLS + x; if (outside[k] || G[k]) continue; outside[k] = 1; st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
      const holeCells = new Set(); for (let k = 0; k < G.length; k++) if (!G[k] && !outside[k]) holeCells.add(k);
      const comps = (pred) => { const seen = new Uint8Array(COLS * ROWS); let c = 0; for (let k = 0; k < G.length; k++) { if (seen[k] || !pred(k)) continue; c++; const s = [k]; while (s.length) { const q = s.pop(); if (seen[q] || !pred(q)) continue; seen[q] = 1; const x = q % COLS, y = (q / COLS) | 0; if (x > 0) s.push(q - 1); if (x < COLS - 1) s.push(q + 1); if (y > 0) s.push(q - COLS); if (y < ROWS - 1) s.push(q + COLS); } } return c; };
      const parts = comps((k) => G[k] === 1), holes = holeCells.size ? comps((k) => holeCells.has(k)) : 0;
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1, ratio = Math.max(bw, bh) / Math.min(bw, bh), fill = n / (bw * bh), area = n * AREA;
      let fam, why;
      if (parts > 1) { fam = "myway"; why = "Varias piezas que se relacionan entre sí: la lógica compuesta de My Way."; }
      else if (holes > 0) { fam = "natura"; why = "Hay un vacío dentro de la planta: un patio que ordena la casa, como en Natura."; }
      else if (ratio >= 2.4 && Math.min(bw, bh) <= 6) { fam = "line"; why = "Una planta larga y estrecha que se estira en un eje: la secuencia de Line."; }
      else if (area <= 40) { fam = "basic"; why = "Una pieza compacta de hasta 40 m²: lo esencial, como Basic."; }
      else if (fill < .7) { fam = "myway"; why = "Una forma libre, con entrantes y salientes: My Way combina lógicas."; }
      else { fam = "natura"; why = "Una planta amplia que crece en dos direcciones, como Natura."; }
      const d = area < 22 ? 0 : area < 42 ? 1 : area < 70 ? 2 : area < 100 ? 3 : 4, b = area < 70 ? 1 : 2;
      const prog = d === 0 ? "Refugio · 1 baño" : `${d} dorm · ${b} baño${b > 1 ? "s" : ""}`;
      return { n, area, bw, bh, ratio, fill, holes, parts, fam, why, prog, x0, y0, x1, y1, holeCells };
    };
    const out = $(".draw-out"), $o = (c) => $(c, out);
    const report = () => {
      info = analyse(); drawing.info = info.n ? info : null;
      if (!info.n) { $o(".o-area").textContent = "0,0 m²"; ["box", "holes", "parts", "prog"].forEach((k) => { $o(`.o-${k}`).textContent = "—"; }); $o(".o-fam strong").textContent = "—"; $o(".o-fam p").textContent = "Pinta unas cuantas celdas para empezar."; $o(".o-3d").hidden = true; drawing.art = ""; syncDraw(); return; }
      $o(".o-area").textContent = `${fmt(info.area, 1)} m²`;
      $o(".o-box").textContent = `${fmt(info.bw * CM)} × ${fmt(info.bh * CM)} m`;
      $o(".o-holes").textContent = info.holes ? `${info.holes} · ${fmt(info.holeCells.size * AREA, 1)} m²` : "No";
      $o(".o-parts").textContent = String(info.parts);
      $o(".o-prog").textContent = info.prog;
      $o(".o-fam strong").textContent = NAMES[info.fam]; $o(".o-fam p").textContent = info.why;
      const b3 = $o(".o-3d"); b3.hidden = false; b3.dataset.openWorld = info.fam; b3.textContent = `Recorrer ${NAMES[info.fam]} en 3D ↗`;
      let art = ""; for (let y = info.y0; y <= info.y1; y++) { for (let x = info.x0; x <= info.x1; x++) art += at(x, y) ? "■" : (info.holeCells.has(y * COLS + x) ? "○" : "·"); art += "\n"; }
      drawing.art = art; syncDraw();
    };
    let cw = 0, chh = 0, cs = 0, d = 1;
    const hatch = (() => { const p = document.createElement("canvas"); p.width = p.height = 8; const g = p.getContext("2d"); g.strokeStyle = "rgba(59,67,176,.5)"; g.beginPath(); g.moveTo(0, 8); g.lineTo(8, 0); g.stroke(); return p; })();
    const drawPlan = (c, w, h, s, dimLabels = true) => {
      c.fillStyle = "#f6f5e8"; c.fillRect(0, 0, w, h); c.lineWidth = 1;
      for (let i = 0; i <= COLS; i++) { c.strokeStyle = i % 4 ? "rgba(12,13,10,.08)" : "rgba(12,13,10,.2)"; c.beginPath(); c.moveTo(Math.round(i * s) + .5, 0); c.lineTo(Math.round(i * s) + .5, h); c.stroke(); }
      for (let j = 0; j <= ROWS; j++) { c.strokeStyle = j % 4 ? "rgba(12,13,10,.08)" : "rgba(12,13,10,.2)"; c.beginPath(); c.moveTo(0, Math.round(j * s) + .5); c.lineTo(w, Math.round(j * s) + .5); c.stroke(); }
      const inf = info && info.n ? info : null;
      if (inf) { c.fillStyle = c.createPattern(hatch, "repeat"); inf.holeCells.forEach((k) => c.fillRect((k % COLS) * s, ((k / COLS) | 0) * s, s, s)); }
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (at(x, y)) { c.fillStyle = "#a9b4fb"; c.fillRect(x * s, y * s, s + .5, s + .5); c.strokeStyle = "rgba(59,67,176,.25)"; c.strokeRect(x * s + .5, y * s + .5, s - 1, s - 1); }
      c.strokeStyle = "#3b43b0"; c.lineWidth = Math.max(2, s * .09); c.lineCap = "square"; c.beginPath();
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (at(x, y)) { const X = x * s, Y = y * s;
        if (!at(x, y - 1)) { c.moveTo(X, Y); c.lineTo(X + s, Y); } if (!at(x, y + 1)) { c.moveTo(X, Y + s); c.lineTo(X + s, Y + s); }
        if (!at(x - 1, y)) { c.moveTo(X, Y); c.lineTo(X, Y + s); } if (!at(x + 1, y)) { c.moveTo(X + s, Y); c.lineTo(X + s, Y + s); } }
      c.stroke();
      if (inf && dimLabels) {
        c.strokeStyle = "#0c0d0a"; c.fillStyle = "#0c0d0a"; c.lineWidth = 1; c.font = `600 ${Math.max(10, s * .34)}px Manrope, sans-serif`; c.textAlign = "center"; c.textBaseline = "bottom";
        const xa = inf.x0 * s, xb = (inf.x1 + 1) * s, ya = inf.y0 * s, yb = (inf.y1 + 1) * s, off = s * .45;
        const dimY = ya - off > 10 ? ya - off : yb + off, dimX = xa - off > 10 ? xa - off : xb + off;
        c.beginPath(); c.moveTo(xa, dimY); c.lineTo(xb, dimY); c.moveTo(xa, dimY - 4); c.lineTo(xa, dimY + 4); c.moveTo(xb, dimY - 4); c.lineTo(xb, dimY + 4);
        c.moveTo(dimX, ya); c.lineTo(dimX, yb); c.moveTo(dimX - 4, ya); c.lineTo(dimX + 4, ya); c.moveTo(dimX - 4, yb); c.lineTo(dimX + 4, yb); c.stroke();
        c.fillText(`${fmt(inf.bw * CM)} m`, (xa + xb) / 2, dimY - 3);
        c.save(); c.translate(dimX - 3, (ya + yb) / 2); c.rotate(-Math.PI / 2); c.fillText(`${fmt(inf.bh * CM)} m`, 0, 0); c.restore();
      }
    };
    const drawIso = (c, w, h) => {
      c.clearRect(0, 0, w, h);
      const inf = info && info.n ? info : null; if (!inf) return;
      const HZ = 2.9 / CM, cx = Math.cos(Math.PI / 6), sy = Math.sin(Math.PI / 6);
      const P = (x, y, z) => [(x - y) * cx, (x + y) * sy - z];
      let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
      for (const [x, y] of [[inf.x0, inf.y0], [inf.x1 + 1, inf.y0], [inf.x0, inf.y1 + 1], [inf.x1 + 1, inf.y1 + 1]]) for (const z of [0, HZ]) { const [a, b] = P(x, y, z); mnx = Math.min(mnx, a); mxx = Math.max(mxx, a); mny = Math.min(mny, b); mxy = Math.max(mxy, b); }
      const k = Math.min((w * .86) / (mxx - mnx), (h * .8) / (mxy - mny)), ox = w / 2 - (mnx + mxx) / 2 * k, oy = h / 2 - (mny + mxy) / 2 * k;
      const Q = (x, y, z) => { const [a, b] = P(x, y, z); return [ox + a * k, oy + b * k]; };
      const poly = (pts, fill) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = fill; c.fill(); };
      inf.holeCells.forEach((q) => { const x = q % COLS, y = (q / COLS) | 0; poly([Q(x, y, 0), Q(x + 1, y, 0), Q(x + 1, y + 1, 0), Q(x, y + 1, 0)], "rgba(223,243,122,.22)"); });
      const cells = []; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (at(x, y)) cells.push([x, y]);
      cells.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
      for (const [x, y] of cells) {
        if (!at(x, y + 1)) poly([Q(x, y + 1, 0), Q(x + 1, y + 1, 0), Q(x + 1, y + 1, HZ), Q(x, y + 1, HZ)], "#7688f7");
        if (!at(x + 1, y)) poly([Q(x + 1, y, 0), Q(x + 1, y + 1, 0), Q(x + 1, y + 1, HZ), Q(x + 1, y, HZ)], "#4d5ad6");
        poly([Q(x, y, HZ), Q(x + 1, y, HZ), Q(x + 1, y + 1, HZ), Q(x, y + 1, HZ)], "#c9d0fd");
      }
      c.strokeStyle = "rgba(20,22,70,.8)"; c.lineWidth = 1.2; c.beginPath();
      for (const [x, y] of cells) {
        const seg = (a, b) => { c.moveTo(...a); c.lineTo(...b); };
        if (!at(x, y - 1)) seg(Q(x, y, HZ), Q(x + 1, y, HZ)); if (!at(x - 1, y)) seg(Q(x, y, HZ), Q(x, y + 1, HZ));
        if (!at(x, y + 1)) { seg(Q(x, y + 1, HZ), Q(x + 1, y + 1, HZ)); seg(Q(x, y + 1, 0), Q(x + 1, y + 1, 0)); }
        if (!at(x + 1, y)) { seg(Q(x + 1, y, HZ), Q(x + 1, y + 1, HZ)); seg(Q(x + 1, y, 0), Q(x + 1, y + 1, 0)); }
        if (!at(x, y + 1) && !at(x + 1, y + 1) || !at(x + 1, y) && !at(x + 1, y + 1)) seg(Q(x + 1, y + 1, 0), Q(x + 1, y + 1, HZ));
        if (!at(x - 1, y + 1) && !at(x, y + 1) && at(x, y)) seg(Q(x, y + 1, 0), Q(x, y + 1, HZ));
        if (!at(x + 1, y - 1) && !at(x + 1, y)) seg(Q(x + 1, y, 0), Q(x + 1, y, HZ));
      }
      c.stroke();
    };
    const render = () => {
      dctx.setTransform(d, 0, 0, d, 0, 0); drawPlan(dctx, cw, chh, cs);
      const r = iso.getBoundingClientRect(), id = Math.min(devicePixelRatio || 1, 2);
      if (iso.width !== Math.round(r.width * id)) { iso.width = Math.round(r.width * id); iso.height = Math.round(r.height * id); }
      ictx.setTransform(id, 0, 0, id, 0, 0); drawIso(ictx, r.width, r.height);
    };
    const size = () => { const r = dcv.getBoundingClientRect(); d = Math.min(devicePixelRatio || 1, 2); cw = r.width; chh = r.height; cs = cw / COLS; dcv.width = Math.round(cw * d); dcv.height = Math.round(chh * d); render(); const sb = $(".draw-scale i"); if (sb) sb.style.width = `${cs * 4}px`; };
    const cellAt = (e) => { const r = dcv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * COLS), Math.floor((e.clientY - r.top) / r.height * ROWS)]; };
    const setCell = (x, y) => { if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return; G[y * COLS + x] = paint; };
    const stroke = (a, b) => { const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1); for (let i = 0; i <= n; i++) setCell(Math.round(a[0] + (b[0] - a[0]) * i / n), Math.round(a[1] + (b[1] - a[1]) * i / n)); };
    dcv.addEventListener("pointerdown", (e) => { e.preventDefault(); snap(); dcv.setPointerCapture(e.pointerId); paint = e.button === 2 ? 0 : tool; lastCell = cellAt(e); setCell(...lastCell); report(); render(); });
    dcv.addEventListener("pointermove", (e) => { if (paint === null) return; const c = cellAt(e); stroke(lastCell, c); lastCell = c; report(); render(); });
    const end = () => { paint = null; }; dcv.addEventListener("pointerup", end); dcv.addEventListener("pointercancel", end);
    dcv.addEventListener("contextmenu", (e) => e.preventDefault());
    $$("[data-tool]").forEach((b) => b.addEventListener("click", () => { tool = b.dataset.tool === "draw" ? 1 : 0; $$("[data-tool]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
    $$("[data-preset]").forEach((b) => b.addEventListener("click", () => { snap(); G.fill(0); PRESET[b.dataset.preset](); report(); render(); }));
    $("[data-clear]")?.addEventListener("click", () => { snap(); G.fill(0); report(); render(); });
    $("[data-undo]")?.addEventListener("click", () => { if (!hist.length) return; G.set(hist.pop()); report(); render(); });
    addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "z" && document.activeElement?.closest?.(".draw")) { e.preventDefault(); $("[data-undo]").click(); } });
    // enviar el dibujo = llevarlo al formulario
    $o(".o-mail").addEventListener("click", (e) => { e.preventDefault(); drawing.sent = true; syncDraw(); toForm(drawing.info ? drawing.info.fam : ""); });
    $(".o-png")?.addEventListener("click", async () => {
      await document.fonts?.ready;
      const Wd = 2000, Hd = 1250, c = document.createElement("canvas"); c.width = Wd; c.height = Hd; const g = c.getContext("2d");
      g.fillStyle = "#eeeccd"; g.fillRect(0, 0, Wd, Hd);
      g.strokeStyle = "#0c0d0a"; g.lineWidth = 2; g.strokeRect(40, 40, Wd - 80, Hd - 80);
      const pw = 1180, ps = pw / COLS, ph = ps * ROWS;
      g.save(); g.translate(80, 150); drawPlan(g, pw, ph, ps); g.restore(); g.strokeRect(80, 150, pw, ph);
      g.save(); g.translate(1300, 150); g.fillStyle = "#3b43b0"; g.fillRect(0, 0, 620, 420); drawIso(g, 620, 420); g.restore();
      g.fillStyle = "#0c0d0a"; g.font = '500 64px "Clash", sans-serif'; g.textBaseline = "alphabetic"; g.fillText("Mi casa sobre la retícula", 80, 118);
      g.font = '600 20px Manrope, sans-serif'; g.fillText("NANCA · RETÍCULA 75 × 75 CM", 1300, 118);
      const inf = info && info.n ? info : null; let y = 640;
      const row = (k, v) => { g.font = '600 18px Manrope, sans-serif'; g.fillStyle = "rgba(12,13,10,.6)"; g.fillText(k.toUpperCase(), 1300, y); g.font = '500 34px "Clash", sans-serif'; g.fillStyle = "#0c0d0a"; g.textAlign = "right"; g.fillText(v, 1920, y); g.textAlign = "left"; g.fillStyle = "rgba(12,13,10,.2)"; g.fillRect(1300, y + 14, 620, 1.5); y += 62; };
      if (inf) { row("Superficie", `${fmt(inf.area, 1)} m²`); row("Envolvente", `${fmt(inf.bw * CM)} × ${fmt(inf.bh * CM)} m`); row("Patios", inf.holes ? String(inf.holes) : "No"); row("Programa", inf.prog); row("Modelo", NAMES[inf.fam]); }
      g.font = '600 18px Manrope, sans-serif'; g.fillStyle = "rgba(12,13,10,.6)"; g.fillText("ORIENTACIÓN INICIAL, NO PROYECTO · HOLA@NANCANANCA.COM", 80, Hd - 70);
      const a = document.createElement("a"); a.download = `nanca-mi-casa-${inf ? NAMES[inf.fam].replace(" ", "") : "reticula"}.png`; a.href = c.toDataURL("image/png"); a.click();
    });
    new ResizeObserver(size).observe(dcv); new ResizeObserver(render).observe(iso);
    PRESET.myway(); report(); size();
  }
  function syncDraw() {
    const lab = $(".f-draw"); if (!lab) return;
    const inf = drawing.info;
    lab.hidden = !(inf && drawing.sent);
    if (inf) $(".f-draw-sum").textContent = `${fmt(inf.area, 1)} m² · ${NAMES[inf.fam]}`;
  }

  /* =========================================================
     Formulario, tarjeta de bienvenida y envío
     ========================================================= */
  const form = $("#lead"), status = $(".f-status", form), wc = $("#welcome");
  const ENDPOINT = (form?.dataset.endpoint || window.NANCA_ENDPOINT || "").trim();
  const W3KEY = (form?.dataset.w3key || "").trim();   // clave de Web3Forms: las solicitudes llegan a hola@nancananca.com
    const makeCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r = crypto.getRandomValues(new Uint8Array(8)); const s = [...r].map((v) => A[v % A.length]).join(""); return `NANCA-W5-${s.slice(0, 4)}-${s.slice(4)}`; };
  const today = () => new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

  async function cardPNG(data) {   // tarjeta en alta resolución: la misma que se ve y la que viaja en el correo
    await document.fonts?.ready;
    const W = 1600, H = 1009, R = 64, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    g.beginPath(); g.roundRect(0, 0, W, H, R); g.clip();
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#7688f7"); bg.addColorStop(.38, "#5a67e0"); bg.addColorStop(1, "#3b43b0"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (let i = 0; i <= 16; i++) for (let j = 0; j <= 10; j++) { const a = clamp((i / 16 + j / 10) / 2 - .2, 0, 1) * .14; g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(i * W / 16, 0, 2, H); g.fillRect(0, j * H / 10, W, 2); }
    const sh = g.createLinearGradient(0, H, W, 0); sh.addColorStop(.35, "rgba(223,243,122,0)"); sh.addColorStop(.55, "rgba(223,243,122,.16)"); sh.addColorStop(.62, "rgba(255,255,255,.14)"); sh.addColorStop(.8, "rgba(169,180,251,0)"); g.fillStyle = sh; g.fillRect(0, 0, W, H);
    g.save(); g.beginPath(); g.rect(0, 0, W, 364); g.clip(); g.strokeStyle = "rgba(223,243,122,.92)"; g.lineWidth = 62; g.beginPath(); g.arc(1232, 314, 465, 0, Math.PI * 2); g.stroke(); g.restore();
    const logo = await loadImg("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYwNy4yNyAxMjEuODIiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0xMDYuOSwxMjEuODJjLTEuNjksMC0zLjM4LS4yNC01LjA2LS43Mi01LjQyLTEuNTYtMTIuNTYtNi4yOC0xNS43Ny0xOS45Mi01LjcyLTI0LjMtMS45OC00Ny42NCwxMC4yMi02Ni4yOC0uNjItLjczLTEuMjYtMS40NC0xLjkxLTIuMTMtMTMuMS0xMy43LTMwLjA3LTE1LjkyLTQ0LjMtNS44LTE5LjMyLDEzLjc0LTI4LjkyLDQwLjU1LTI5LjMzLDg0LjI0bC0yMC43NS0uMkMuNDgsNjAuMiwxMi45MywyNy45MywzOC4wNSwxMC4wNiw2MC42LTUuOTcsODkuMjYtMi42LDEwOS4zOCwxOC40NGMuMjEuMjIuNDIuNDQuNjIuNjYsNy4wNC02LjExLDE0LjkxLTEwLjIsMjMuOTUtMTIuNDdsNS4wNCwyMC4xM2MtNi42MywxLjY2LTEyLjA3LDQuNzEtMTcuMTQsOS42MWwtLjAyLjAyYzguMzMsMTYuODEsMTEuMzMsMzcuNyw4LjA5LDU5LjI1LTEuMTksNy45My01LjI2LDE4LjE5LTEzLjA5LDIzLjIxLTMuMDYsMS45Ni02LjQ3LDIuOTctOS45MywyLjk3Wm0uOTMtNjQuMDhjLTQuMjYsMTEuNTUtNC44NSwyNC43MS0xLjU2LDM4LjY4LjI4LDEuMi41OSwyLjE2Ljg4LDIuOTEuODktMS42MiwxLjg0LTQuMDMsMi4yNS02Ljc5LDEuODYtMTIuMzQsMS4yNS0yNC4yOC0xLjU3LTM0LjgxaDBaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJtMjQwLjM1LDMuNjh2MTQuNjFjLTMuNzItNC45LTguMzktOC44My0xNC4wMS0xMS43OC02LjQ2LTMuMzktMTMuNzktNS4wOS0yMS45OS01LjA5LTEwLjAzLDAtMTkuMDMsMi40OS0yNyw3LjQ2LTcuOTgsNC45OC0xNC4yOCwxMS42OS0xOC45MSwyMC4xMy00LjY0LDguNDUtNi45NSwxNy45NS02Ljk1LDI4LjVzMi4zMSwyMC4wNiw2Ljk1LDI4LjVjNC42Myw4LjQ1LDEwLjk0LDE1LjEyLDE4LjkxLDIwLjAyLDcuOTgsNC45LDE2Ljk4LDcuMzUsMjcsNy4zNSw4LjIsMCwxNS41Ny0xLjcsMjIuMS01LjA5LDUuNjItMi45MiwxMC4yNS02LjgyLDEzLjktMTEuNjl2MTQuNTJoMjAuNzNWMy42OGgtMjAuNzNabS03Ljk4LDgwLjE4Yy02LjIzLDYuODYtMTQuNDMsMTAuMjktMjQuNjEsMTAuMjktNi44NCwwLTEyLjkxLTEuNTgtMTguMjMtNC43NS01LjMyLTMuMTctOS40Ni03LjUtMTIuNDItMTMuMDEtMi45Ni01LjUtNC40NC0xMS44Ny00LjQ0LTE5LjExczEuNDgtMTMuMzgsNC40NC0xOC44OWMyLjk2LTUuNSw3LjA2LTkuODQsMTIuMy0xMy4wMXMxMS4yOC00Ljc1LDE4LjEyLTQuNzUsMTIuNzksMS41NSwxNy44OSw0LjY0YzUuMDksMy4wOSw5LjA4LDcuNDMsMTEuOTYsMTMuMDFzNC4zMywxMS45OSw0LjMzLDE5LjIzYzAsMTAuNzEtMy4xMiwxOS40OS05LjM0LDI2LjM1aDBaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJtMzcyLjg5LDIzLjQ3Yy0zLjY1LTYuNTYtOC42Mi0xMS44Ny0xNC45My0xNS45NS02LjMtNC4wNy0xMy41Ni02LjExLTIxLjc2LTYuMTFzLTE1LjU3LDEuODUtMjIuMSw1LjU0Yy00LjkyLDIuNzgtOS4wMiw2LjMyLTEyLjMsMTAuNlYzLjY4aC0yMC41MXYxMDcuNDRoMjAuNTF2LTYyLjY1YzAtNS40MywxLjIxLTEwLjI1LDMuNjUtMTQuNDgsMi40My00LjIyLDUuNzctNy41NCwxMC4wMy05Ljk1LDQuMjUtMi40MSw5LjExLTMuNjIsMTQuNTgtMy42Miw4LjIsMCwxNC44NSwyLjY0LDE5Ljk0LDcuOTJzNy42MywxMS45OSw3LjYzLDIwLjEzdjYyLjY1aDIwLjczVjQ0LjM5YzAtNy4zOS0xLjgyLTE0LjM2LTUuNDctMjAuOTJaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJtNTg2LjU0LDMuNjh2MTQuNjFjLTMuNzItNC45LTguMzktOC44My0xNC4wMS0xMS43OC02LjQ2LTMuMzktMTMuNzktNS4wOS0yMS45OS01LjA5LTEwLjAzLDAtMTkuMDMsMi40OS0yNyw3LjQ2LTcuOTcsNC45OC0xNC4yOCwxMS42OS0xOC45MSwyMC4xMy00LjY0LDguNDUtNi45NSwxNy45NS02Ljk1LDI4LjUsMCwuOTUuMDMsMS44OS4wNiwyLjgyLTQuMzUsNC41Ny04LjcxLDkuMTMtMTMuMDYsMTMuNy00LjI2LDQuNDYtOC41Niw4Ljk2LTEzLjY0LDEyLjQ2LTYuMzgsNC4zOC0xMy4zMiw2LjA4LTIwLjk4LDYuMDgtNi44NCwwLTEyLjkxLTEuNTgtMTguMjMtNC43NXMtOS40OS03LjQ2LTEyLjUzLTEyLjg5LTQuNTYtMTEuNjgtNC41Ni0xOC43NywxLjUyLTEzLjM1LDQuNTYtMTguNzdjMy4wNC01LjQzLDcuMjEtOS42OSwxMi41My0xMi43OHMxMS4zOS00LjY0LDE4LjIzLTQuNjRjNS42MiwwLDEwLjg2LDEuMDIsMTUuNzIsMy4wNSw0Ljg2LDIuMDQsOC45Niw1LjAyLDEyLjMsOC45M2wxMy42Ny0xMy41N2MtNS4xNy01Ljg4LTExLjMyLTEwLjM3LTE4LjQ2LTEzLjQ2LTcuMTQtMy4wOS0xNC44OS00LjY0LTIzLjI0LTQuNjQtMTAuNjMsMC0yMC4yNCwyLjQ1LTI4LjgyLDcuMzUtOC41OCw0LjktMTUuMzQsMTEuNTctMjAuMjgsMjAuMDJzLTcuNDEsMTcuOTUtNy40MSwyOC41LDIuNDcsMTkuODcsNy40MSwyOC4zOWM0LjkzLDguNTIsMTEuNjksMTUuMjcsMjAuMjgsMjAuMjQsOC41OCw0Ljk4LDE4LjE5LDcuNDYsMjguODIsNy40NiwxMy4wNCwwLDI1LjQyLTQuODQsMzUuNzItMTIuNyw2LjUtNC45NSwxMS44Ny0xMC45MiwxNy4xLTE3LjA0LjU0LDEuMTksMS4xMywyLjM1LDEuNzYsMy41LDQuNjMsOC40NSwxMC45NCwxNS4xMiwxOC45MSwyMC4wMiw3Ljk3LDQuOSwxNi45OCw3LjM1LDI3LDcuMzUsOC4yLDAsMTUuNTctMS43LDIyLjEtNS4wOSw1LjYyLTIuOTIsMTAuMjUtNi44MiwxMy45LTExLjY5djE0LjUyaDIwLjczVjMuNjhoLTIwLjczWm0tNy45Nyw4MC4xOGMtNi4yMyw2Ljg2LTE0LjQzLDEwLjI5LTI0LjYxLDEwLjI5LTYuODQsMC0xMi45MS0xLjU4LTE4LjIzLTQuNzVzLTkuNDYtNy41LTEyLjQyLTEzLjAxYy0yLjk2LTUuNS00LjQ0LTExLjg3LTQuNDQtMTkuMTFzMS40OC0xMy4zOCw0LjQ0LTE4Ljg5YzIuOTYtNS41LDcuMDYtOS44NCwxMi4zLTEzLjAxczExLjI4LTQuNzUsMTguMTEtNC43NSwxMi44LDEuNTUsMTcuODksNC42NCw5LjA3LDcuNDMsMTEuOTYsMTMuMDFjMi44OCw1LjU4LDQuMzMsMTEuOTksNC4zMywxOS4yMywwLDEwLjcxLTMuMTEsMTkuNDktOS4zNCwyNi4zNWgwWiIvPjwvc3ZnPg=="); if (logo) { const lw = W * .3; g.drawImage(logo, W * .07, H * .09, lw, lw * (logo.height / logo.width || .25)); }
    g.fillStyle = "#dff37a"; g.font = "700 34px Manrope, sans-serif"; g.letterSpacing = "5px"; g.fillText("TARJETA DE BIENVENIDA", W * .07, H * .27);
    g.letterSpacing = "-12px"; g.font = '500 420px "Clash", sans-serif'; g.fillText("5", W * .055, H * .66); const w5 = g.measureText("5").width; g.font = '500 210px "Clash", sans-serif'; g.fillText("%", W * .055 + w5 + 6, H * .66);
    g.letterSpacing = "0px"; g.fillStyle = "#fff"; g.font = "600 50px Manrope, sans-serif"; g.fillText("sobre tu futura casa Nanca", W * .07, H * .74);
    const field = (lab, val, x, align = "left") => { g.textAlign = align; g.fillStyle = "rgba(255,255,255,.7)"; g.font = "700 24px Manrope, sans-serif"; g.letterSpacing = "4px"; g.fillText(lab, x, H * .855); g.letterSpacing = "1px"; g.fillStyle = "#fff"; g.font = "700 40px Manrope, sans-serif"; g.fillText(val, x, H * .915); g.textAlign = "left"; g.letterSpacing = "0px"; };
    const full = `${data.nombre} ${data.apellidos}`.trim(), name = full.length > 20 ? full.slice(0, 19) + "…" : full;
    field("TITULAR", name, W * .07, "left"); field("CÓDIGO", data.code, W * .42); field("MODELO", data.modelo ? NAMES[data.modelo] : "Por elegir", W * .93, "right");
    g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 3; g.beginPath(); g.roundRect(1.5, 1.5, W - 3, H - 3, R); g.stroke();
    return c.toDataURL("image/png");
  }

  // tarjeta viva: inclinación, brillo holográfico y giro
  const card3d = $(".wcard-3d", wc);
  if (card3d) {
    card3d.addEventListener("pointermove", (e) => { const r = card3d.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; card3d.classList.add("move"); card3d.style.setProperty("--ry", `${(px - .5) * 26}deg`); card3d.style.setProperty("--rx", `${(.5 - py) * 20}deg`); card3d.style.setProperty("--gx", `${px * 100}%`); card3d.style.setProperty("--gy", `${py * 100}%`); });
    card3d.addEventListener("pointerleave", () => { card3d.classList.remove("move"); card3d.style.setProperty("--rx", "0deg"); card3d.style.setProperty("--ry", "0deg"); });
    const flip = () => card3d.classList.toggle("flipped");
    card3d.addEventListener("click", flip);
    card3d.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    if (!reduce) addEventListener("deviceorientation", (e) => { if (!wc.open || e.gamma == null) return; card3d.style.setProperty("--ry", `${clamp(e.gamma, -30, 30) * .6}deg`); card3d.style.setProperty("--rx", `${clamp(e.beta - 45, -30, 30) * -.4}deg`); card3d.style.setProperty("--gx", `${50 + clamp(e.gamma, -30, 30)}%`); });
  }
  // entrada: las celdas de la retícula vuelan y se ordenan en la tarjeta
  function burst() {
    if (reduce) return;
    const r = card3d.getBoundingClientRect(), cv = document.createElement("canvas"), d = Math.min(devicePixelRatio || 1, 2);
    cv.className = "wc-burst"; cv.width = innerWidth * d; cv.height = innerHeight * d; wc.append(cv);
    const g = cv.getContext("2d"); g.scale(d, d);
    const cols = 16, rows = 10, cw = r.width / cols, chh = r.height / rows, P = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a = Math.random() * Math.PI * 2, dist = 300 + Math.random() * 500; P.push({ tx: r.left + i * cw, ty: r.top + j * chh, sx: r.left + r.width / 2 + Math.cos(a) * dist, sy: r.top + r.height / 2 + Math.sin(a) * dist, del: Math.random() * .35, col: Math.random() < .25 ? "#dff37a" : "#7688f7" }); }
    const t0 = performance.now();
    const f = (now) => {
      const t = (now - t0) / 1000; g.clearRect(0, 0, innerWidth, innerHeight);
      let alive = false;
      for (const p of P) { const k = smooth(0, 1, (t - p.del) / .9), fade = 1 - smooth(1.05, 1.5, t); if (fade <= 0) continue; alive = true; const x = p.sx + (p.tx - p.sx) * k, y = p.sy + (p.ty - p.sy) * k; g.globalAlpha = fade * (k > 0 ? 1 : 0); g.fillStyle = p.col; g.fillRect(x + 1, y + 1, cw - 2, chh - 2); }
      if (alive) requestAnimationFrame(f); else cv.remove();
    };
    requestAnimationFrame(f);
  }
  function openWelcome(data, card, sent, mode) {
    $(".wc-name", wc).textContent = data.nombre;
    $(".wc-name2", wc).textContent = `${data.nombre} ${data.apellidos}`.trim();
    $(".wc-code-v", wc).textContent = data.code; $(".wc-code-b", wc).textContent = data.code;
    $(".wc-model-v", wc).textContent = data.modelo ? NAMES[data.modelo] : "Por elegir";
    $(".wc-date", wc).textContent = `Emitida el ${data.fecha} · válida 12 meses`;
    $(".wc-png", wc).hidden = !card;
    $(".wc-png", wc).onclick = () => { if (!card) return; const a = document.createElement("a"); a.download = `nanca-bienvenida-${data.code}.png`; a.href = card; a.click(); };
    $(".wc-mail", wc).innerHTML = "";
    const mailP = $(".wc-mail", wc);
    if (sent && mode === "manual") mailP.textContent = `Hemos recibido tu solicitud. En breve te escribiremos a ${data.email} desde hola@nancananca.com con tu tarjeta${data.modelo ? ` y el A3 de ${NAMES[data.modelo]}` : ""}. Mientras, puedes guardar tu tarjeta.`;
    else if (sent) mailP.textContent = `Te acabamos de escribir a ${data.email} desde hola@nancananca.com con tu tarjeta${data.modelo ? ` y el A3 de ${NAMES[data.modelo]}` : ""}. Si no lo ves en unos minutos, revisa promociones o spam.`;
    else {
      mailP.textContent = "Guarda tu tarjeta. Para que tu solicitud nos llegue, envíanosla también por correo: ";
      const body = `Hola, Nanca:\n\nSoy ${data.nombre} ${data.apellidos}.\nCorreo: ${data.email}\nTeléfono: ${data.telefono || "-"}\nModelo: ${data.modelo ? NAMES[data.modelo] : "aún no lo sé"}\nParcela: ${data.parcela || "-"} · ${data.ubicacion || "-"}\nPlazo: ${data.plazo || "-"}\nInterés: ${data.interes || "-"}\n\n${data.mensaje || ""}\n${data.dibujo ? `\nMi dibujo:\n${data.dibujo}\n` : ""}\nTarjeta de bienvenida: ${data.code}`;
      const a = document.createElement("a"); a.href = `mailto:hola@nancananca.com?subject=${encodeURIComponent(`Bienvenida web · ${data.code}`)}&body=${encodeURIComponent(body)}`; a.textContent = "abrir correo ↗"; mailP.append(a);
    }
    wc.showModal(); document.body.classList.add("lock");
    card3d.classList.add("flipped"); setTimeout(() => card3d.classList.remove("flipped"), reduce ? 0 : 700);
    requestAnimationFrame(burst);
  }
  wc?.addEventListener("close", () => document.body.classList.remove("lock"));
  $(".wc-close", wc)?.addEventListener("click", () => wc.close());

  if (form) {
    const qmod = location.search.match(/[?&]modelo=(basic|line|natura|myway)/); if (qmod) { const r = $(`input[name=modelo][value=${qmod[1]}]`, form); if (r) r.checked = true; }
    form.addEventListener("input", (e) => e.target.classList?.remove("bad"));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.elements.web.value) return;   // trampa para robots
      const F = form.elements, bad = [];
      if (!F.nombre.value.trim()) bad.push(F.nombre);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(F.email.value.trim())) bad.push(F.email);
      if (!F.privacidad.checked) bad.push(F.privacidad);
      bad.forEach((x) => x.classList.add("bad"));
      if (bad.length) { status.className = "f-status err"; status.textContent = bad.includes(F.privacidad) && bad.length === 1 ? "Necesitamos tu conformidad con el tratamiento de datos." : "Revisa tu nombre y tu correo electrónico."; bad[0].focus(); return; }
      const btn = $(".f-send", form); btn.disabled = true; status.className = "f-status"; status.textContent = "Preparando tu bienvenida…";
      const data = {
        nombre: F.nombre.value.trim(), apellidos: F.apellidos.value.trim(), email: F.email.value.trim(), telefono: F.telefono.value.trim(),
        modelo: F.modelo.value, parcela: F.parcela.value, ubicacion: F.ubicacion.value.trim(), plazo: F.plazo.value, interes: F.interes.value, mensaje: F.mensaje.value.trim(),
        code: makeCode(), fecha: today(), origen: location.href.split("#")[0], privacidad: F.privacidad.checked, comunicaciones: !!F.comunicaciones?.checked,
      };
      if (drawing.info && drawing.sent && F.con_dibujo?.checked) data.dibujo = `${drawing.art}\nSuperficie ${fmt(drawing.info.area, 1)} m² · ${fmt(drawing.info.bw * .75)} × ${fmt(drawing.info.bh * .75)} m · ${drawing.info.prog} · sugerido ${NAMES[drawing.info.fam]}`;
      let card = null;
      try { card = await cardPNG(data); } catch (err) { console.warn("Tarjeta no generada", err); }
      let sent = false, mode = "";
      if (W3KEY) {
        try {
          const M = data.modelo ? NAMES[data.modelo] : "Aún no lo sabe";
          const res = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({
            access_key: W3KEY, subject: `Nueva solicitud web · ${M} · ${data.nombre} ${data.apellidos}`.trim(), from_name: "Web Nanca", replyto: data.email, botcheck: "",
            "Nombre": `${data.nombre} ${data.apellidos}`.trim(), "Correo": data.email, "Teléfono": data.telefono || "-", "Modelo": M,
            "Parcela": data.parcela || "-", "Ubicación": data.ubicacion || "-", "Plazo": data.plazo || "-", "Interés": data.interes || "-", "Mensaje": data.mensaje || "-",
            "Dibujo": data.dibujo || "-", "Tarjeta de bienvenida": `${data.code} · emitida el ${data.fecha}`,
            "Privacidad": data.privacidad ? "Aceptada" : "No", "Comunicaciones comerciales": data.comunicaciones ? "Sí" : "No", "Origen": data.origen,
          }) });
          const j = await res.json().catch(() => ({})); sent = !!j.success; mode = sent ? "manual" : "";
        } catch (err) { sent = false; }
      }
      if (!sent && ENDPOINT) {
        try {
          await fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...data, card }) });
          sent = true; mode = "auto";
        } catch (err) { sent = false; }
      }
      btn.disabled = false;
      status.textContent = sent ? (mode === "manual" ? `Listo, ${data.nombre}. Hemos recibido tu solicitud.` : `Listo, ${data.nombre}. Revisa tu correo.`) : "";
      btn.disabled = false;
      openWelcome(data, card, sent, mode);
    });
  }

  /* =========================================================
     Película de tecnología (release de GitHub)
     ========================================================= */
  const video = $(".film video");
  if (video) {   // la película va dentro de la web: funciona con el dominio propio y sin depender de GitHub
    const src = document.createElement("source"); src.type = "video/mp4"; src.src = "assets/v7/nanca-v1-system-film.mp4"; video.append(src);
  }
  if (video) new IntersectionObserver(([e]) => { if (e.isIntersecting) video.play?.().catch(() => {}); else video.pause?.(); }, { threshold: .2 }).observe(video);
})();
