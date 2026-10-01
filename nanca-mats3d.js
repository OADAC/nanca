/* Nanca · v20 — la materia en estructura: cuatro pórticos de 3 × 3 m en tiempo real (three.js) */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TEX = "mundos/assets/tex/";
const loader = new THREE.TextureLoader();
const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/* ---------- texturas ---------- */
// Con la página servida, texturas PBR de los modelos 3D; si no se pueden leer (p. ej. abriendo el archivo con doble clic), se generan aquí.
const LOCAL = location.protocol === "file:";
const cache = new Map();
function canvasTex(draw, size = 512) { const c = document.createElement("canvas"); c.width = c.height = size; draw(c.getContext("2d"), size); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const GEN = {
  concrete: () => canvasTex((g, n) => { g.fillStyle = "#cdc8bf"; g.fillRect(0, 0, n, n); for (let i = 0; i < 26000; i++) { const v = 150 + rnd() * 80; g.fillStyle = `rgba(${v},${v - 4},${v - 10},.35)`; g.fillRect(rnd() * n, rnd() * n, 1 + rnd() * 2, 1 + rnd() * 2); } for (let i = 0; i < 260; i++) { g.fillStyle = "rgba(80,76,70,.35)"; g.beginPath(); g.arc(rnd() * n, rnd() * n, .6 + rnd() * 1.8, 0, 7); g.fill(); } }),
  wood: () => canvasTex((g, n) => { g.fillStyle = "#b98a5a"; g.fillRect(0, 0, n, n); for (let x = 0; x < n; x += 1) { const k = Math.sin(x * .09 + Math.sin(x * .013) * 4) * .5 + .5; g.fillStyle = `rgba(${90 + k * 60},${58 + k * 40},${30 + k * 22},.35)`; g.fillRect(x, 0, 1, n); } for (let i = 0; i < 1600; i++) { g.fillStyle = "rgba(70,40,20,.12)"; g.fillRect(rnd() * n, rnd() * n, 1, 6 + rnd() * 30); } }),
};
function tex(file, srgb, rep = 1) {
  const key = file + rep;
  if (cache.has(key)) return cache.get(key);
  let t;
  if (LOCAL) { if (!srgb) return null; t = file.startsWith("kitchen") ? GEN.wood() : GEN.concrete(); }
  else {
    t = loader.load(TEX + file, undefined, undefined, () => { if (srgb) { const f = file.startsWith("kitchen") ? GEN.wood() : GEN.concrete(); t.image = f.image; t.needsUpdate = true; } });
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  }
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8;
  cache.set(key, t); return t;
}
function recycledTex() {   // plástico reciclado: base gris con escamas de color
  const c = document.createElement("canvas"); c.width = c.height = 1024; const g = c.getContext("2d");
  g.fillStyle = "#4f5862"; g.fillRect(0, 0, 1024, 1024);
  
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${30 + rnd() * 40},${35 + rnd() * 40},${45 + rnd() * 40},.5)`; g.fillRect(rnd() * 1024, rnd() * 1024, 2 + rnd() * 3, 2 + rnd() * 3); }
  const cols = ["#7688f7", "#dff37a", "#eeeccd", "#3f8f8a", "#a9b4fb", "#1d2026", "#c9c6bb"];
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * 1024, y = rnd() * 1024, r = 2 + rnd() * 9, n = 3 + (rnd() * 4 | 0);
    g.fillStyle = cols[(rnd() * cols.length) | 0]; g.globalAlpha = .55 + rnd() * .45; g.beginPath();
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + rnd(), rr = r * (.5 + rnd() * .6); k ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill();
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* UV proyectadas en metros, con la veta a lo largo del eje indicado (para que la textura no se estire) */
function boxUV(geo, scale = 1, grain = "y") {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    const c = { x, y, z }, face = ax > ay && ax > az ? "x" : ay > az ? "y" : "z";
    const plane = ["x", "y", "z"].filter((k) => k !== face);
    let u, v;
    if (face !== grain) { v = c[grain]; u = c[plane.find((k) => k !== grain)]; } else { u = c[plane[0]]; v = c[plane[1]]; }
    uv[i * 2] = u / scale; uv[i * 2 + 1] = v / scale;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return geo;
}

/* ---------- geometrías ---------- */
const rbox = (w, h, d, r = .012) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2));
function iShape(h, b, tf, tw) {
  const s = new THREE.Shape(), H = h / 2, B = b / 2, T = tw / 2;
  s.moveTo(-B, -H); s.lineTo(B, -H); s.lineTo(B, -H + tf); s.lineTo(T, -H + tf); s.lineTo(T, H - tf); s.lineTo(B, H - tf); s.lineTo(B, H); s.lineTo(-B, H); s.lineTo(-B, H - tf); s.lineTo(-T, H - tf); s.lineTo(-T, -H + tf); s.lineTo(-B, -H + tf); s.closePath();
  return s;
}
function iColumn(L, h = .2, b = .2, tf = .015, tw = .009) { const g = new THREE.ExtrudeGeometry(iShape(h, b, tf, tw), { depth: L, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, -L / 2, 0); return g; }
function iBeam(L, axis, h = .3, b = .15, tf = .0107, tw = .0071) {   // viga: alas horizontales, alma vertical
  const g = new THREE.ExtrudeGeometry(iShape(h, b, tf, tw), { depth: L, bevelEnabled: false });
  g.translate(0, 0, -L / 2); if (axis === "x") g.rotateY(Math.PI / 2); return g;
}
function deck(W, L, pitch = .2, rib = .055, t = .003) {   // chapa grecada con nervios a lo largo de z
  const s = new THREE.Shape(), n = Math.round(W / pitch), x0 = -W / 2, a = pitch * .35, sl = pitch * .1, top = [];
  for (let i = 0; i < n; i++) { const x = x0 + i * pitch; top.push([x, 0], [x + a, 0], [x + a + sl, rib], [x + pitch - sl, rib]); }
  top.push([W / 2, 0]);
  s.moveTo(...top[0]); top.slice(1).forEach((q) => s.lineTo(...q));
  top.slice().reverse().forEach(([x, y]) => s.lineTo(x, y - t));
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: L, bevelEnabled: false }); g.translate(0, 0, -L / 2); return g;
}
const cyl = (r, h, seg = 20) => new THREE.CylinderGeometry(r, r, h, seg);
function rod(a, b, r) {   // barra entre dos puntos
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
  const g = cyl(r, L, 12); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  g.applyQuaternion(q); return { g, pos: A.add(B).multiplyScalar(.5) };
}

/* ---------- materiales ---------- */
function mats() {
  const concrete = new THREE.MeshStandardMaterial({ map: tex("plastered_wall_02_diff.jpg", true), normalMap: tex("plastered_wall_02_nor.jpg"), roughnessMap: tex("plastered_wall_02_arm.jpg"), color: 0xd4d0c8, roughness: 1, normalScale: new THREE.Vector2(.9, .9) });
  const wood = new THREE.MeshStandardMaterial({ map: tex("kitchen_wood_diff.jpg", true), normalMap: tex("kitchen_wood_nor.jpg"), roughnessMap: tex("kitchen_wood_arm.jpg"), color: 0xf0d2a8, roughness: .9 });
  const woodClt = wood.clone(); woodClt.color = new THREE.Color(0xe6c393);
  const steel = new THREE.MeshStandardMaterial({ color: 0x3f444c, metalness: .72, roughness: .36 });
  const galv = new THREE.MeshStandardMaterial({ color: 0xb4bac1, metalness: .9, roughness: .28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c1f24, metalness: .6, roughness: .45 });
  const rt = recycledTex();
  const recycled = new THREE.MeshPhysicalMaterial({ map: rt, roughness: .55, clearcoat: .25, clearcoatRoughness: .5 });
  const recycledLav = new THREE.MeshPhysicalMaterial({ map: rt, color: 0xc3cbff, roughness: .5, clearcoat: .3 });
  return { concrete, wood, woodClt, steel, galv, dark, recycled, recycledLav };
}

/* ---------- las cuatro estructuras (en metros; módulo de 3 × 3 m) ---------- */
const C = 1.35;   // eje de pilares
const corners = [[-C, -C], [C, -C], [-C, C], [C, C]];
function build(kind, M) {
  const P = [];   // piezas: { geo, mat, pos:[x,y,z], rot? }
  const add = (geo, mat, x, y, z, uv) => { if (uv) boxUV(geo, uv[0], uv[1]); P.push({ geo, mat, pos: [x, y, z] }); };
  if (kind === "hormigon") {
    corners.forEach(([x, z]) => add(rbox(.7, .25, .7, .02), M.concrete, x, .125, z, [1.2, "x"]));
    corners.forEach(([x, z]) => add(rbox(.3, 2.6, .3, .015), M.concrete, x, 1.55, z, [1.2, "y"]));
    [-C, C].forEach((z) => add(rbox(3.0, .45, .3, .015), M.concrete, 0, 3.075, z, [1.2, "x"]));
    [-C, C].forEach((x) => add(rbox(.3, .45, 2.4, .015), M.concrete, x, 3.075, 0, [1.2, "z"]));
    // losa alveolar: placas con juntas visibles
    for (let i = 0; i < 3; i++) add(rbox(1.1, .2, 3.3, .012), M.concrete, -1.1 + i * 1.1, 3.4, 0, [1.2, "z"]);
  }
  if (kind === "acero") {
    corners.forEach(([x, z]) => {
      add(new THREE.BoxGeometry(.42, .03, .42), M.dark, x, .015, z);
      for (const [dx, dz] of [[-.14, -.14], [.14, -.14], [-.14, .14], [.14, .14]]) add(cyl(.016, .07, 12), M.galv, x + dx, .05, z + dz);
      add(iColumn(2.87), M.steel, x, .03 + 1.435, z);
    });
    [-C, C].forEach((z) => add(iBeam(2.5, "x"), M.steel, 0, 2.75, z));
    [-C, C].forEach((x) => add(iBeam(2.5, "z"), M.steel, x, 2.75, 0));
    corners.forEach(([x, z]) => { add(new THREE.BoxGeometry(.012, .26, .16), M.dark, x + (x < 0 ? .115 : -.115), 2.75, z); add(new THREE.BoxGeometry(.16, .26, .012), M.dark, x, 2.75, z + (z < 0 ? .115 : -.115)); });
    // arriostramiento en cruz con tensor
    for (const [a, b] of [[[-C + .1, .2, -C], [C - .1, 2.6, -C]], [[C - .1, .2, -C], [-C + .1, 2.6, -C]]]) { const r = rod(a, b, .014); P.push({ geo: r.g, mat: M.galv, pos: r.pos.toArray() }); }
    add(deck(3.1, 3.1), M.galv, 0, 2.905, 0);
  }
  if (kind === "madera") {
    corners.forEach(([x, z]) => { add(new THREE.BoxGeometry(.3, .04, .3), M.dark, x, .02, z); add(new THREE.BoxGeometry(.012, .22, .2), M.dark, x - .106, .15, z); add(new THREE.BoxGeometry(.012, .22, .2), M.dark, x + .106, .15, z); });
    corners.forEach(([x, z]) => add(rbox(.2, 2.62, .2, .008), M.wood, x, .06 + 1.31, z, [.9, "y"]));
    [-C, C].forEach((z) => add(rbox(3.3, .36, .16, .008), M.wood, 0, 2.86, z, [.9, "x"]));
    for (let i = 0; i < 7; i++) add(rbox(.08, .22, 3.0, .006), M.wood, -1.2 + i * .4, 3.15, 0, [.9, "z"]);
    // panel contralaminado (CLT) a medio colocar: deja ver las viguetas
    add(rbox(3.3, .1, 1.5, .006), M.woodClt, 0, 3.31, -.78, [.9, "x"]);
    corners.forEach(([x, z]) => add(new THREE.BoxGeometry(.24, .24, .01), M.dark, x, 2.86, z + (z < 0 ? .085 : -.085)));
  }
  if (kind === "reciclado") {
    corners.forEach(([x, z]) => add(rbox(.16, 2.7, .16, .02), M.recycled, x, 1.35, z, [.8, "y"]));
    [-C, C].forEach((z) => add(rbox(3.1, .2, .14, .02), M.recycled, 0, 2.8, z, [.8, "x"]));
    // paneles nervados en el fondo y un lateral
    const panel = (w, axis, x, z) => {
      add(rbox(axis === "x" ? w : .05, 2.3, axis === "x" ? .05 : w, .01), M.recycledLav, x, 1.3, z, [.8, "y"]);
      const n = Math.round(w / .15);
      for (let i = 0; i < n; i++) { const o = -w / 2 + (i + .5) * (w / n); add(rbox(axis === "x" ? .045 : .05, 2.3, axis === "x" ? .05 : .045, .012), M.recycledLav, axis === "x" ? x + o : x + .045, 1.3, axis === "x" ? z + .045 : z + o, [.8, "y"]); }
    };
    panel(1.22, "x", -.66, -C); panel(1.22, "x", .66, -C); panel(1.22, "z", -C, -.66);
    for (let i = 0; i < 12; i++) add(rbox(3.3, .05, .16, .012), M.recycled, 0, 2.935, -1.4 + i * .255, [.8, "x"]);
  }
  return P;
}

/* ---------- un solo motor para las cuatro tarjetas ----------
   Un único lienzo WebGL cubre la rejilla y cada pórtico se dibuja en el hueco de su tarjeta (scissor).
   La preparación se reparte en pasos pequeños, en momentos libres del navegador, y empieza antes de llegar a la sección:
   así no hay parón al hacer scroll. */
const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 120 }) : setTimeout(fn, 16));
const gridEl = document.querySelector(".mat-grid");
const items = gridEl ? [...gridEl.querySelectorAll("li")].map((li) => ({ li, box: li.querySelector(".struct"), kind: li.dataset.mat })).filter((it) => it.box) : [];
items.forEach(({ box }) => { const hint = document.createElement("span"); hint.className = "struct-hint"; hint.textContent = "Arrastra para girar"; box.append(hint); });

let R = null, canvas = null, env = null, M = null, gridRect = null, visible = false, raf = 0, last = 0;
const DPR = Math.min(devicePixelRatio || 1, 1.5);

function layout() {
  if (!R) return;
  gridRect = gridEl.getBoundingClientRect();
  R.setSize(gridRect.width, gridRect.height, false);
  for (const it of items) {
    const r = it.box.getBoundingClientRect();
    it.rect = { x: r.left - gridRect.left, y: r.top - gridRect.top, w: r.width, h: r.height };
    if (it.cam) { it.cam.aspect = r.width / r.height; it.cam.updateProjectionMatrix(); }
  }
}

function initRenderer() {
  canvas = document.createElement("canvas"); canvas.className = "mats-gl"; canvas.setAttribute("aria-hidden", "true");
  R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  R.setPixelRatio(DPR); R.setClearColor(0x000000, 0); R.setScissorTest(true);
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  gridEl.append(canvas);
  M = mats();
  new ResizeObserver(layout).observe(gridEl); addEventListener("resize", layout); layout();
}

function makeScene(it) {
  const scene = new THREE.Scene(); scene.environment = env; scene.environmentIntensity = .75;
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.4); sun.position.set(5, 9, 4); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 25 }); sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 4;
  scene.add(sun, new THREE.HemisphereLight(0xdfe3ff, 0x202228, .45));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.ShadowMaterial({ opacity: .5 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const pts = []; for (let i = -3; i <= 3; i++) { const v = i * .75; pts.push(-2.25, 0, v, 2.25, 0, v, v, 0, -2.25, v, 0, 2.25); }
  const gridG = new THREE.BufferGeometry(); gridG.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.LineSegments(gridG, new THREE.LineBasicMaterial({ color: 0x7688f7, transparent: true, opacity: .28 })));
  scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]].map(([x, z]) => new THREE.Vector3(x, .002, z))), new THREE.LineBasicMaterial({ color: 0xdff37a, transparent: true, opacity: .7 })));
  it.pieces = build(it.kind, M).map((p, i) => {
    const m = new THREE.Mesh(p.geo, p.mat); m.castShadow = m.receiveShadow = true;
    const base = new THREE.Vector3(...p.pos), lvl = base.y / 3.4;
    m.userData = { base, exp: new THREE.Vector3(base.x * .28, .2 + lvl * .75, base.z * .28), delay: i * .085 };
    scene.add(m); return m;
  });
  it.scene = scene;
  it.cam = new THREE.PerspectiveCamera(30, 1, .1, 60); it.target = new THREE.Vector3(0, 1.95, 0);
  Object.assign(it, { az: .75 + Math.random() * .3, drag: null, hover: 0, hoverT: 0, t0: null, seen: false });
  const { box, li } = it;
  box.addEventListener("pointerdown", (e) => { it.drag = { x: e.clientX, az: it.az }; box.setPointerCapture(e.pointerId); box.classList.add("dragging"); });
  box.addEventListener("pointermove", (e) => { if (it.drag) it.az = it.drag.az - (e.clientX - it.drag.x) * .01; });
  const up = () => { it.drag = null; box.classList.remove("dragging"); }; box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
  li.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { it.hover = 1; li.classList.add("exploded"); } });
  li.addEventListener("pointerleave", () => { it.hover = 0; li.classList.remove("exploded"); });
  // el montaje empieza cuando la tarjeta se ve de verdad, no cuando se prepara
  new IntersectionObserver(([e], ob) => { if (e.isIntersecting) { it.seen = true; ob.disconnect(); } }, { threshold: .35 }).observe(box);
  layout();
  // texturas a la GPU antes del primer dibujo (si no, el primer fotograma las sube de golpe)
  scene.traverse((o) => { const m = o.material; if (!m) return; for (const key of ["map", "normalMap", "roughnessMap"]) if (m[key] && m[key].image) R.initTexture(m[key]); });
  return R.compileAsync ? R.compileAsync(scene, it.cam) : Promise.resolve();
}

function frame(now) {
  const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
  const H = gridRect.height;
  for (const it of items) {
    if (!it.scene || !it.rect || !it.ready) continue;
    // solo se dibuja la tarjeta que está en pantalla
    const top = gridRect.top + it.rect.y; if (top > innerHeight || top + it.rect.h < 0) continue;
    if (it.seen && it.t0 === null) it.t0 = now;
    const t = reduce ? 99 : it.t0 === null ? -1 : (now - it.t0) / 1000;
    if (!it.drag && !reduce) it.az += dt * .12;
    it.hoverT += (it.hover - it.hoverT) * (1 - Math.exp(-dt * 3.2));
    const Rr = 12.6 + it.hoverT * 1.6, pol = 1.08, { cam, target } = it;
    cam.position.set(target.x + Rr * Math.sin(pol) * Math.cos(it.az), target.y + Rr * Math.cos(pol), target.z + Rr * Math.sin(pol) * Math.sin(it.az)); cam.lookAt(target);
    for (const m of it.pieces) {
      const { base, exp, delay } = m.userData, k = ease((t - .3 - delay) / 1.4);
      m.position.set(base.x + exp.x * it.hoverT, base.y + exp.y * it.hoverT + (1 - k) * 4.5, base.z + exp.z * it.hoverT);
      m.visible = k > 0;
    }
    const { x, y, w, h } = it.rect;
    R.setViewport(x, H - y - h, w, h); R.setScissor(x, H - y - h, w, h);
    R.render(it.scene, cam);
    if (!it.live) { it.live = true; it.box.classList.add("live"); }
  }
  raf = visible ? requestAnimationFrame(frame) : 0;
}
const kick = () => { if (visible && !raf && R) { gridRect = gridEl.getBoundingClientRect(); last = 0; raf = requestAnimationFrame(frame); } };
// posición de la rejilla al hacer scroll (sin recalcular diseño en cada fotograma)
addEventListener("scroll", () => { if (R && visible) gridRect = gridEl.getBoundingClientRect(); }, { passive: true });

if (gridEl && items.length) {
  let started = false;
  const start = () => {
    if (started) return; started = true;
    const steps = [() => initRenderer(), () => { env = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), .04).texture; }, ...items.map((it) => () => makeScene(it).then(() => { it.ready = true; kick(); }))];
    const run = () => { const s = steps.shift(); if (!s) return; try { const r = s(); (r && r.then ? r : Promise.resolve()).finally(() => idle(run)); } catch (e) { console.warn("3D de materiales no disponible", e); } };
    idle(run);
  };
  // se prepara en reposo, poco después de cargar la página (y, si alguien llega antes, al acercarse)
  new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { rootMargin: "150% 0px 150% 0px" }).observe(gridEl);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { threshold: 0 }).observe(gridEl);
}
