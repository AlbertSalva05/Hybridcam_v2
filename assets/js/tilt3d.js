/* hero 3D tilt cards: one Three.js card per slide, five parallax paper layers.
   Falls back to the CSS graphic if WebGL or the CDN is unavailable. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const CW = 1024, CH = 768, W = 3.2, H = 2.4, R = 0.16, DEPTH = 0.06, PX = CW / W;
const Z = [0.07, 0.16, 0.27, 0.4, 0.58];
const FOV = 32;
const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
const D = { body: "#1a2552", bodyDark: "#0a1128", lens: "#070d22", edge: "rgba(255,255,255,0.16)", text: "#f2f5ff", text2: "#b7c0da", pink: "#ee5a92", gold: "#e8cfc0", mint: "#a9bdf5" };
const UI = '"Manrope", "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

/* ------------------------------------------------------------ palette */
function palette() {
  const s = getComputedStyle(document.documentElement);
  const v = (n, f) => s.getPropertyValue(n).trim() || f;
  const light = document.documentElement.getAttribute("data-theme") === "light";
  return {
    light,
    surface: v("--c-surface-2", "#121c3d"), ink: v("--c-ink", "#f2f5ff"), line: v("--c-line-strong", "rgba(255,255,255,0.16)"),
    pink: v("--c-pink", "#ee5a92"), gold: v("--c-gold", "#e8cfc0"), mint: v("--c-mint", "#a9bdf5"),
    card: light ? "#ffffff" : "#1c2856",
    shadow: light ? "rgba(14,27,64,0.22)" : "rgba(0,0,0,0.5)",
    ground: light ? "rgba(14,27,64,0.34)" : "rgba(0,0,0,0.62)"
  };
}
function hexA(hex, a) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) { return hex; }
  const n = parseInt(hex.slice(1), 16);
  return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

/* ------------------------------------------------------------ 2D helpers */
function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
}
function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
function paper(c, P, blur) { c.shadowColor = P.shadow; c.shadowBlur = blur || 28; c.shadowOffsetY = (blur || 28) * 0.36; }
function flat(c) { c.shadowColor = "transparent"; c.shadowBlur = 0; c.shadowOffsetY = 0; }
function glow(c, color, a, x, y) {
  const g = c.createRadialGradient(x || 512, y || 384, 0, x || 512, y || 384, 460);
  g.addColorStop(0, hexA(color, a)); g.addColorStop(1, hexA(color, 0));
  c.fillStyle = g; c.fillRect(0, 0, CW, CH);
}
function tag(c, P, text, dot, pos) {
  c.font = "700 27px " + UI;
  const w = c.measureText(text).width + 84, h = 58;
  const x = pos === "tl" ? 56 : CW - 56 - w, y = pos === "tl" ? 54 : CH - 54 - h;
  paper(c, P, 22); rr(c, x, y, w, h, 29); c.fillStyle = P.surface; c.fill();
  flat(c); c.lineWidth = 2; c.strokeStyle = P.line; c.stroke();
  circle(c, x + 31, y + 29, 8); c.fillStyle = dot; c.fill();
  c.fillStyle = P.ink; c.textBaseline = "middle"; c.textAlign = "left"; c.fillText(text, x + 52, y + 30);
}
function ellipsePt(cx, cy, rx, ry, rot, t) {
  const x = rx * Math.cos(t), y = ry * Math.sin(t);
  return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
}
function bodyFill(c, y0, y1) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "#26336a"); g.addColorStop(1, D.bodyDark); return g; }

/* ------------------------------------------------------------ slide art, five layers each */
const DRAW = {
  camera: [
    (c, P) => {
      glow(c, P.pink, 0.16);
      c.lineWidth = 3; c.strokeStyle = P.line;
      c.beginPath(); c.ellipse(512, 410, 420, 220, -0.16, 0, Math.PI * 2); c.stroke();
      c.setLineDash([6, 12]); c.beginPath(); c.ellipse(512, 410, 300, 150, 0.22, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      let p = ellipsePt(512, 410, 420, 220, -0.16, 3.6); circle(c, p[0], p[1], 11); c.fillStyle = P.pink; c.fill();
      p = ellipsePt(512, 410, 300, 150, 0.22, 0.5); circle(c, p[0], p[1], 9); c.fillStyle = P.gold; c.fill();
    },
    (c, P) => {
      paper(c, P);
      rr(c, 418, 212, 190, 92, 24); c.fillStyle = D.body; c.fill();
      rr(c, 252, 268, 520, 312, 48); c.fillStyle = bodyFill(c, 268, 580); c.fill();
      flat(c); c.lineWidth = 2; c.strokeStyle = D.edge; c.stroke();
      rr(c, 252, 300, 98, 250, 40); c.fillStyle = D.bodyDark; c.fill();
      rr(c, 650, 236, 74, 34, 12); c.fillStyle = D.pink; c.fill();
      rr(c, 472, 236, 82, 40, 10); c.fillStyle = D.lens; c.fill();
    },
    (c, P) => {
      paper(c, P, 34);
      const g = c.createRadialGradient(530, 400, 10, 548, 428, 136); g.addColorStop(0, "#2c3a72"); g.addColorStop(1, "#0b1230");
      circle(c, 548, 428, 136); c.fillStyle = g; c.fill();
      flat(c); c.lineWidth = 7; c.strokeStyle = D.gold; circle(c, 548, 428, 120); c.stroke();
      circle(c, 548, 428, 92); c.fillStyle = D.lens; c.fill();
      const ig = c.createRadialGradient(540, 418, 4, 548, 428, 52); ig.addColorStop(0, D.mint); ig.addColorStop(1, D.pink);
      circle(c, 548, 428, 50); c.fillStyle = ig; c.fill();
      c.fillStyle = "rgba(255,255,255,0.82)"; c.beginPath(); c.ellipse(518, 392, 22, 10, -0.6, 0, Math.PI * 2); c.fill();
    },
    (c, P) => tag(c, P, "Shutter 4,820 verified", P.gold, "br"),
    (c, P) => tag(c, P, "Live 3-way call", P.mint, "tl")
  ],
  vault: [
    (c, P) => {
      glow(c, P.gold, 0.16);
      [[372, 150], [470, 104], [574, 158], [664, 112]].forEach((p) => {
        paper(c, P, 14);
        const g = c.createLinearGradient(p[0] - 30, p[1] - 30, p[0] + 30, p[1] + 30); g.addColorStop(0, "#f3e2d7"); g.addColorStop(1, "#c58b7a");
        circle(c, p[0], p[1], 30); c.fillStyle = g; c.fill();
        flat(c); circle(c, p[0], p[1], 20); c.lineWidth = 3; c.strokeStyle = "rgba(114,59,48,0.35)"; c.stroke();
      });
    },
    (c, P) => {
      paper(c, P);
      rr(c, 272, 226, 480, 430, 44); c.fillStyle = bodyFill(c, 226, 656); c.fill();
      flat(c); c.lineWidth = 2; c.strokeStyle = D.edge; c.stroke();
      rr(c, 412, 252, 200, 18, 9); c.fillStyle = D.lens; c.fill();
      [[304, 258], [720, 258], [304, 624], [720, 624]].forEach((p) => { circle(c, p[0], p[1], 7); c.fillStyle = "rgba(255,255,255,0.18)"; c.fill(); });
    },
    (c, P) => {
      paper(c, P, 16);
      c.beginPath(); c.moveTo(512, 292); c.lineTo(562, 310); c.lineTo(562, 350);
      c.quadraticCurveTo(560, 392, 512, 414); c.quadraticCurveTo(464, 392, 462, 350); c.lineTo(462, 310); c.closePath();
      const sg = c.createLinearGradient(0, 292, 0, 414); sg.addColorStop(0, D.pink); sg.addColorStop(1, "#c8326f"); c.fillStyle = sg; c.fill();
      flat(c);
      rr(c, 494, 346, 36, 30, 6); c.fillStyle = "#fff"; c.fill();
      c.beginPath(); c.arc(512, 346, 12, Math.PI, 0); c.lineWidth = 6; c.strokeStyle = "#fff"; c.stroke();
      c.textAlign = "center"; c.textBaseline = "alphabetic";
      c.font = "800 66px " + UI; c.fillStyle = D.text; c.fillText("₱36,000", 512, 496);
      rr(c, 362, 520, 300, 14, 7); c.fillStyle = "rgba(255,255,255,0.14)"; c.fill();
      rr(c, 362, 520, 186, 14, 7); c.fillStyle = D.mint; c.fill();
      c.font = "700 24px " + UI; c.fillStyle = D.text2; c.fillText("Held in escrow", 512, 588);
    },
    (c, P) => tag(c, P, "Releases on OTP", P.mint, "br"),
    (c, P) => tag(c, P, "Funds captured", P.gold, "tl")
  ],
  inspect: [
    (c, P) => {
      glow(c, P.mint, 0.16);
      c.fillStyle = P.line;
      for (let x = 40; x < CW; x += 48) { for (let y = 40; y < CH; y += 48) { circle(c, x, y, 2); c.fill(); } }
    },
    (c, P) => {
      paper(c, P);
      rr(c, 236, 126, 456, 548, 30); c.fillStyle = "#ffffff"; c.fill();
      flat(c); c.lineWidth = 2; c.strokeStyle = "rgba(14,27,64,0.1)"; c.stroke();
      c.beginPath(); c.moveTo(276, 222); c.lineTo(652, 222); c.strokeStyle = "rgba(14,27,64,0.12)"; c.stroke();
    },
    (c, P) => {
      paper(c, P, 8);
      c.textAlign = "left"; c.textBaseline = "alphabetic";
      c.font = "600 22px " + MONO; c.fillStyle = "#b8165a"; c.fillText("Inspection · HC-24817", 276, 194);
      ["Power on", "Shutter fire", "Sensor clean", "Glass clear", "Dials ok"].forEach((l, i) => {
        const y = 252 + i * 78;
        rr(c, 276, y, 38, 38, 10);
        if (i < 3) {
          c.fillStyle = "#2b4597"; c.fill();
          flat(c); c.beginPath(); c.moveTo(286, y + 20); c.lineTo(293, y + 28); c.lineTo(305, y + 11);
          c.lineWidth = 5; c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = "#fff"; c.stroke(); paper(c, P, 8);
        } else {
          flat(c); c.lineWidth = 3; c.strokeStyle = i === 3 ? "#b8165a" : "rgba(14,27,64,0.28)"; c.stroke(); paper(c, P, 8);
        }
        c.font = "700 29px " + UI; c.fillStyle = i < 4 ? "#0e1b40" : "#556081"; c.fillText(l, 336, y + 29);
      });
    },
    (c, P) => {
      paper(c, P, 30);
      c.beginPath(); c.moveTo(822, 412); c.lineTo(900, 490); c.lineWidth = 28; c.lineCap = "round"; c.strokeStyle = D.body; c.stroke();
      circle(c, 742, 332, 112); c.fillStyle = "rgba(169,189,245,0.2)"; c.fill();
      c.lineWidth = 18; c.strokeStyle = D.body; c.stroke();
      flat(c); c.beginPath(); c.arc(742, 332, 82, 3.6, 4.5); c.lineWidth = 7; c.strokeStyle = "rgba(255,255,255,0.75)"; c.stroke();
      tag(c, P, "Clip attached", P.pink, "br");
    },
    (c, P) => tag(c, P, "9 of 12 signed", P.mint, "tl")
  ],
  radar: [
    (c, P) => {
      glow(c, P.pink, 0.14);
      c.lineWidth = 1.5; c.strokeStyle = P.line; c.beginPath();
      for (let x = 0; x <= CW; x += 64) { c.moveTo(x, 0); c.lineTo(x, CH); }
      for (let y = 0; y <= CH; y += 64) { c.moveTo(0, y); c.lineTo(CW, y); }
      c.stroke();
    },
    (c, P) => {
      paper(c, P, 34);
      const g = c.createRadialGradient(512, 400, 20, 512, 410, 300); g.addColorStop(0, "#26336a"); g.addColorStop(1, D.bodyDark);
      circle(c, 512, 410, 300); c.fillStyle = g; c.fill();
      flat(c); c.lineWidth = 2; c.strokeStyle = D.edge; c.stroke();
      c.strokeStyle = "rgba(169,189,245,0.24)"; [100, 200].forEach((r) => { circle(c, 512, 410, r); c.stroke(); });
      c.strokeStyle = "rgba(255,255,255,0.1)"; c.beginPath(); c.moveTo(212, 410); c.lineTo(812, 410); c.moveTo(512, 110); c.lineTo(512, 710); c.stroke();
    },
    (c) => {
      const a0 = -1.0, a1 = -0.1;
      if (c.createConicGradient) {
        const g = c.createConicGradient(a0, 512, 410);
        g.addColorStop(0, "rgba(169,189,245,0)"); g.addColorStop((a1 - a0) / (Math.PI * 2), "rgba(169,189,245,0.55)"); g.addColorStop((a1 - a0) / (Math.PI * 2) + 0.001, "rgba(169,189,245,0)");
        c.fillStyle = g;
      } else { c.fillStyle = "rgba(169,189,245,0.25)"; }
      c.beginPath(); c.moveTo(512, 410); c.arc(512, 410, 296, a0, a1); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(512, 410); c.lineTo(512 + Math.cos(a1) * 296, 410 + Math.sin(a1) * 296); c.lineWidth = 3; c.strokeStyle = "rgba(205,217,255,0.85)"; c.stroke();
    },
    (c, P) => {
      [[612, 292, D.mint, "Meet point"], [360, 494, D.gold, "Seller"], [640, 534, D.pink, "Rider 0.9 km"]].forEach((p) => {
        paper(c, P, 14);
        circle(c, p[0], p[1], 15); c.fillStyle = "#fff"; c.fill();
        flat(c); circle(c, p[0], p[1], 10); c.fillStyle = p[2]; c.fill();
        c.font = "700 22px " + UI; const w = c.measureText(p[3]).width + 28;
        paper(c, P, 10); rr(c, p[0] + 24, p[1] - 19, w, 38, 19); c.fillStyle = "rgba(7,13,34,0.92)"; c.fill();
        flat(c); c.fillStyle = D.text; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(p[3], p[0] + 38, p[1] + 1);
      });
      tag(c, P, "Pin expires in 15 min", P.mint, "br");
    },
    (c, P) => tag(c, P, "ETA 8 min", P.pink, "tl")
  ]
};

/* ------------------------------------------------------------ 3D helpers */
function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function canvasTex(w, h) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  return { cv, ctx: cv.getContext("2d"), tex };
}

class TiltCard {
  constructor(stage, slide, kind) {
    this.stage = stage; this.slide = slide; this.kind = kind;
    this.tx = 0; this.ty = 0; this.cx = 0; this.cy = 0; this.raf = 0; this.visible = true;
    this.P = palette();

    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    r.domElement.className = "slider__tilt"; r.domElement.setAttribute("aria-hidden", "true");

    const scene = this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r), room = new RoomEnvironment();
    this.env = pm.fromScene(room, 0.04).texture; scene.environment = this.env;
    pm.dispose(); if (room.dispose) { room.dispose(); }
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(2, 3, 4); scene.add(key);

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
    this.group = new THREE.Group(); scene.add(this.group);

    /* card: rounded box squashed in z keeps big corner radii on a thin slab */
    const cardGeo = new RoundedBoxGeometry(W, H, 0.36, 6, R);
    this.cardMat = new THREE.MeshPhysicalMaterial({ color: this.P.card, roughness: 0.42, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06 });
    const card = new THREE.Mesh(cardGeo, this.cardMat); card.scale.z = DEPTH / 0.36; this.group.add(card);

    /* sheen: skewed white band, additive, slides with tilt */
    const sh = canvasTex(1024, 256);
    const sg = sh.ctx.createLinearGradient(380, 0, 644, 256);
    sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.36, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,1)");
    sg.addColorStop(0.64, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(255,255,255,0)");
    sh.ctx.fillStyle = sg; sh.ctx.fillRect(0, 0, 1024, 256);
    sh.tex.repeat.x = 0.5; sh.tex.offset.x = 0.25;
    const sheenGeo = new THREE.ShapeGeometry(rrShape(W, H, R), 10);
    const pos = sheenGeo.attributes.position, uv = sheenGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) { uv.setXY(i, (pos.getX(i) + W / 2) / W, (pos.getY(i) + H / 2) / H); }
    this.sheenTex = sh.tex;
    this.sheenMat = new THREE.MeshBasicMaterial({ map: sh.tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: this.P.light ? 0.32 : 0.16 });
    const sheen = new THREE.Mesh(sheenGeo, this.sheenMat); sheen.position.z = DEPTH / 2 + 0.003; sheen.renderOrder = 1; this.group.add(sheen);

    /* five paper layers */
    const plane = new THREE.PlaneGeometry(W, H);
    this.layers = Z.map((z, i) => {
      const t = canvasTex(CW, CH); t.tex.anisotropy = r.capabilities.getMaxAnisotropy();
      const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: t.tex, transparent: true, depthWrite: false, toneMapped: false }));
      m.position.z = z; m.renderOrder = 2 + i; this.group.add(m);
      return { mesh: m, t, z, draw: DRAW[kind][i] };
    });

    /* contact shadow on the floor */
    this.ground = canvasTex(512, 256);
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.5), new THREE.MeshBasicMaterial({ map: this.ground.tex, transparent: true, depthWrite: false, toneMapped: false }));
    this.shadow.rotation.x = -Math.PI / 2; this.shadow.position.y = -H / 2 - 0.3; scene.add(this.shadow);

    this.paint();
    stage.appendChild(r.domElement); stage.classList.add("is-3d");

    this.tick = this.tick.bind(this);
    this.onMove = (e) => {
      const b = this.stage.getBoundingClientRect(); if (!b.width) { return; }
      this.tx = Math.max(-0.5, Math.min(0.5, (e.clientX - b.left) / b.width - 0.5));
      this.ty = Math.max(-0.5, Math.min(0.5, (e.clientY - b.top) / b.height - 0.5));
      this.kick();
    };
    this.onLeave = () => { this.tx = 0; this.ty = 0; this.kick(); };
    slide.addEventListener("pointermove", this.onMove);
    slide.addEventListener("pointerleave", this.onLeave);
    slide.addEventListener("pointercancel", this.onLeave);
    this.onUp = (e) => { if (e.pointerType !== "mouse") { this.onLeave(); } };
    slide.addEventListener("pointerup", this.onUp);
    this.onVis = () => { if (!document.hidden) { this.kick(); } };
    document.addEventListener("visibilitychange", this.onVis);

    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(stage);
    this.io = new IntersectionObserver((en) => { this.visible = en[0].isIntersecting; this.kick(); }); this.io.observe(stage);
    this.resize();
  }

  paint() {
    const P = this.P = palette();
    this.cardMat.color.set(P.card);
    this.sheenMat.opacity = P.light ? 0.32 : 0.16;
    this.layers.forEach((L) => {
      const c = L.t.ctx;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH);
      c.save(); rr(c, 0, 0, CW, CH, R * PX); c.clip();
      L.draw(c, P); c.restore(); L.t.tex.needsUpdate = true;
    });
    const g = this.ground.ctx; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 512, 256); g.setTransform(1, 0, 0, 0.5, 0, 0);
    const rg = g.createRadialGradient(256, 256, 0, 256, 256, 250); rg.addColorStop(0, P.ground); rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg; g.fillRect(0, 0, 512, 512); this.ground.tex.needsUpdate = true;
  }

  resize() {
    const w = this.stage.clientWidth, h = this.stage.clientHeight; if (!w || !h) { return; }
    this.renderer.setSize(w, h, false);
    const a = w / h, t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const dist = Math.max((H / 2) * 1.34 / t, (W / 2) * 1.2 / (t * a));
    this.camera.aspect = a; this.camera.position.set(0, 0.3, dist); this.camera.lookAt(0, -0.14, 0);
    this.camera.updateProjectionMatrix(); this.draw();
  }

  /* brief tilt on show so visitors see it is 3D, then settle flat */
  intro() {
    if (reduceMQ.matches) { return; }
    clearTimeout(this.introT);
    this.tx = 0.32; this.ty = -0.2; this.kick();
    this.introT = setTimeout(() => { this.tx = 0; this.ty = 0; this.kick(); }, 750);
  }
  active() { return this.slide.classList.contains("slider__slide--active"); }
  canRun() { return this.visible && this.active() && !document.hidden; }

  apply() {
    const m = reduceMQ.matches ? 0.3 : 1, x = this.cx, y = this.cy;
    this.group.rotation.y = x * 0.95 * m;
    this.group.rotation.x = y * 0.75 * m;
    this.layers.forEach((L) => { L.mesh.position.x = -x * L.z * 0.9 * m; L.mesh.position.y = y * L.z * 0.9 * m; });
    this.sheenTex.offset.x = 0.25 + x * 0.5 * m;
    this.shadow.position.x = -x * 0.55 * m; this.shadow.position.z = -y * 0.35 * m;
    this.shadow.scale.x = 1 - Math.abs(x) * 0.18 * m;
  }
  draw() { this.apply(); this.renderer.render(this.scene, this.camera); }
  kick() {
    if (this.raf || !this.canRun()) { return; }
    this.last = performance.now(); this.raf = requestAnimationFrame(this.tick);
  }
  tick(now) {
    this.raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000)); this.last = now;
    const k = 1 - Math.exp(-dt * 7);
    this.cx += (this.tx - this.cx) * k; this.cy += (this.ty - this.cy) * k;
    this.draw();
    if (Math.abs(this.tx - this.cx) + Math.abs(this.ty - this.cy) > 0.0004 && this.canRun()) { this.raf = requestAnimationFrame(this.tick); }
  }

  dispose() {
    if (this.raf) { cancelAnimationFrame(this.raf); }
    this.ro.disconnect(); this.io.disconnect();
    this.slide.removeEventListener("pointermove", this.onMove);
    this.slide.removeEventListener("pointerleave", this.onLeave);
    this.slide.removeEventListener("pointercancel", this.onLeave);
    this.slide.removeEventListener("pointerup", this.onUp);
    clearTimeout(this.introT);
    document.removeEventListener("visibilitychange", this.onVis);
    this.scene.traverse((o) => {
      if (o.geometry) { o.geometry.dispose(); }
      if (o.material) { if (o.material.map) { o.material.map.dispose(); } o.material.dispose(); }
    });
    this.env.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss();
    this.renderer.domElement.remove(); this.stage.classList.remove("is-3d");
  }
}

/* ------------------------------------------------------------ boot */
function webgl() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
}
function fonts() {
  if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
  const all = Promise.all([document.fonts.load("800 66px " + UI), document.fonts.load("700 27px " + UI), document.fonts.load("600 22px " + MONO)]);
  return Promise.race([all, new Promise((r) => setTimeout(r, 2500))]).catch(() => {});
}

async function boot() {
  const root = document.querySelector("[data-slider]");
  if (!root || !webgl()) { return; }
  await fonts();
  const cards = new Map();
  const ensure = (slide) => {
    const stage = slide.querySelector(".slider__stage"), gfx = stage && stage.querySelector(".gfx");
    if (!stage || cards.has(stage) || !gfx) { return; }
    const kind = Object.keys(DRAW).find((k) => gfx.classList.contains("gfx--" + k)) || "camera";
    try { const c = new TiltCard(stage, slide, kind); cards.set(stage, c); c.intro(); } catch (e) { stage.classList.remove("is-3d"); }
  };
  const scan = () => {
    cards.forEach((c, stage) => { if (!stage.isConnected) { c.dispose(); cards.delete(stage); } });
    root.querySelectorAll(".slider__slide").forEach((slide) => {
      if (slide.classList.contains("slider__slide--active")) { ensure(slide); }
      if (slide.__tiltWatch) { return; }
      slide.__tiltWatch = new MutationObserver(() => {
        if (!slide.classList.contains("slider__slide--active")) { return; }
        ensure(slide);
        const c = cards.get(slide.querySelector(".slider__stage")); if (c) { c.draw(); c.intro(); }
      });
      slide.__tiltWatch.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });
  };
  new MutationObserver(scan).observe(root, { childList: true });
  new MutationObserver(() => cards.forEach((c) => { c.paint(); c.draw(); })).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  reduceMQ.addEventListener && reduceMQ.addEventListener("change", () => cards.forEach((c) => c.draw()));
  window.addEventListener("pagehide", (e) => { if (!e.persisted) { cards.forEach((c) => c.dispose()); cards.clear(); } });
  scan();
}
boot();
