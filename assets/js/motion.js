/* text motion: masked letter headlines + line-by-line paragraphs */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var H_SEL = ".slider__title, .section-head__title, .hero__title";
  var P_SEL = ".slider__lede, .section-head__lede, .hero__lede";

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function words(text) { return text.replace(/\s+/g, " ").trim().split(" "); }
  function groupByTop(nodes) {
    var lines = [], top = null;
    nodes.forEach(function (n) {
      if (top === null || Math.abs(n.offsetTop - top) > 4) { lines.push([]); top = n.offsetTop; }
      lines[lines.length - 1].push(n.textContent);
    });
    return lines;
  }
  function observe(el, onIn) {
    if (reduce || !("IntersectionObserver" in window)) { el.classList.add("is-in"); return; }
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { el.classList.add("is-in"); io.disconnect(); if (onIn) { onIn(); } }
    }, { threshold: 0.4 });
    io.observe(el);
  }

  /* ---------------------------------------------------- headlines */
  function charHTML(word, state) {
    var out = "";
    for (var k = 0; k < word.length; k++) {
      out += '<span class="mask-ch" style="--i:' + (state.i++) + '">' + esc(word[k]) + "</span>";
    }
    return '<span class="mask-word">' + out + "</span>";
  }
  function buildHeading(el) {
    var lines = el.__lines, state = { i: 0 };
    el.style.setProperty("--step", (el.__text.length > 40 ? 40 : 55) + "ms");
    el.innerHTML = lines.map(function (ln, n) {
      var cls = "mask-line" + (n === lines.length - 1 && lines.length > 1 ? " mask-line--accent" : "");
      return '<span class="' + cls + '" aria-hidden="true">' + ln.map(function (w) { return charHTML(w, state); }).join(" ") + "</span>";
    }).join("");
  }
  function measureHeading(el) {
    if (el.__explicit) { return buildHeading(el); }
    el.innerHTML = words(el.__text).map(function (w) { return '<span class="mask-probe">' + esc(w) + "</span>"; }).join(" ");
    el.__lines = groupByTop([].slice.call(el.querySelectorAll(".mask-probe")));
    buildHeading(el);
  }
  function initHeading(el) {
    if (el.__mask) { return; }
    el.__mask = true;
    var html = el.innerHTML;
    var tmp = document.createElement("div"); tmp.innerHTML = html.replace(/<br\s*\/?>/gi, " ");
    el.__text = tmp.textContent.replace(/\s+/g, " ").trim();
    if (/<br\s*\/?>/i.test(html)) {
      el.__explicit = true;
      el.__lines = html.split(/<br\s*\/?>/i).map(function (part) {
        var d = document.createElement("div"); d.innerHTML = part; return words(d.textContent);
      });
    }
    el.setAttribute("aria-label", el.__text);
    el.classList.add("mask-head");
    measureHeading(el);
    el.__followers = [];
    observe(el, function () { el.__followers.forEach(function (p) { p.classList.add("is-in"); }); });
  }

  /* ---------------------------------------------------- paragraphs */
  function splitPara(el) {
    el.innerHTML = words(el.__text).map(function (w) { return '<span class="ln-w">' + esc(w) + "</span>"; }).join(" ");
    var lines = groupByTop([].slice.call(el.querySelectorAll(".ln-w")));
    var half = Math.ceil(lines.length / 2);
    el.innerHTML = lines.map(function (ln, n) {
      return '<span class="ln' + (lines.length > 1 && n >= half ? " ln--muted" : "") + '" style="--i:' + n + '">' + esc(ln.join(" ")) + "</span>";
    }).join("");
  }
  function initPara(el) {
    if (el.__ln) { return; }
    el.__ln = true;
    el.__text = el.textContent.replace(/\s+/g, " ").trim();
    el.classList.add("ln-para");
    splitPara(el);
    /* hierarchy: a paragraph waits for the heading above it to finish rising */
    var head = el.parentNode && el.parentNode.querySelector(".mask-head");
    if (head && !reduce) {
      var step = parseInt(head.style.getPropertyValue("--step"), 10) || 55;
      var chars = head.querySelectorAll(".mask-ch").length;
      el.style.setProperty("--base", Math.round(Math.max(0, chars - 1) * step + 500) + "ms");
      if (head.classList.contains("is-in")) { el.classList.add("is-in"); } else { head.__followers.push(el); }
      return;
    }
    observe(el);
  }

  /* ---------------------------------------------------- replay on slide change */
  function replay(el) { el.classList.remove("is-in"); void el.offsetWidth; el.classList.add("is-in"); }
  function watchSlides() {
    [].forEach.call(document.querySelectorAll(".slider__slide"), function (slide) {
      if (slide.__mwatch) { return; }
      slide.__mwatch = new MutationObserver(function () {
        if (reduce || !slide.classList.contains("slider__slide--active")) { return; }
        [].forEach.call(slide.querySelectorAll(".mask-head, .ln-para"), replay);
      });
      slide.__mwatch.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });
  }

  function scan() {
    [].forEach.call(document.querySelectorAll(H_SEL), initHeading);
    [].forEach.call(document.querySelectorAll(P_SEL), initPara);
    watchSlides();
  }
  function remeasure() {
    [].forEach.call(document.querySelectorAll(".mask-head"), measureHeading);
    [].forEach.call(document.querySelectorAll(".ln-para"), splitPara);
  }

  /* bento fallback for browsers without :has() */
  function bento() {
    var hasHas = window.CSS && CSS.supports && CSS.supports("selector(:has(*))");
    if (hasHas) { return; }
    [].forEach.call(document.querySelectorAll("[data-bento]"), function (grid) {
      [].forEach.call(grid.querySelectorAll(".bento__tile"), function (tile) {
        var onIn = function () { grid.classList.add("is-focus"); tile.classList.add("is-hot"); };
        var onOut = function () { grid.classList.remove("is-focus"); tile.classList.remove("is-hot"); };
        tile.addEventListener("pointerenter", onIn); tile.addEventListener("pointerleave", onOut);
        tile.addEventListener("focusin", onIn); tile.addEventListener("focusout", onOut);
      });
    });
  }

  /* spotlight border on feature + service cards */
  var SPOT_SEL = ".sim-card, .svc";
  function spotlight() {
    [].forEach.call(document.querySelectorAll(SPOT_SEL), function (card) {
      if (card.parentNode.classList && card.parentNode.classList.contains("spot")) { return; }
      var wrap = document.createElement("div"); wrap.className = "spot";
      card.parentNode.insertBefore(wrap, card); wrap.appendChild(card);
      if (!card.hasAttribute("tabindex") && !card.querySelector("a, button, input, select, textarea")) { card.tabIndex = 0; }
      if (reduce) { return; }
      var raf = 0, x = 0, y = 0;
      function set() {
        raf = 0;
        wrap.style.setProperty("--mx", x + "px"); wrap.style.setProperty("--my", y + "px");
        /* border light rides the nearest edge so it always reads along the rim */
        var w = wrap.offsetWidth, h = wrap.offsetHeight, bx = x, by = y;
        var dl = x, dr = w - x, dt = y, db = h - y, d = Math.min(dl, dr, dt, db);
        if (d > 0) {
          if (d === dl) { bx = 0; } else if (d === dr) { bx = w; } else if (d === dt) { by = 0; } else { by = h; }
          bx = Math.max(0, Math.min(w, bx)); by = Math.max(0, Math.min(h, by));
        }
        wrap.style.setProperty("--bx", bx + "px"); wrap.style.setProperty("--by", by + "px");
      }
      var leaveT = 0;
      function leave() {
        /* push the light out past the nearest edge, then fade it */
        var w = wrap.offsetWidth, h = wrap.offsetHeight, dx = x - w / 2, dy = y - h / 2, len = Math.hypot(dx, dy) || 1;
        x = w / 2 + (dx / len) * (w / 2 + 260); y = h / 2 + (dy / len) * (h / 2 + 260);
        wrap.classList.add("spot--leave"); wrap.classList.remove("spot--on"); set();
        clearTimeout(leaveT); leaveT = setTimeout(function () { wrap.classList.remove("spot--leave"); }, 460);
      }
      wrap.addEventListener("pointermove", function (e) {
        var r = wrap.getBoundingClientRect(); x = e.clientX - r.left; y = e.clientY - r.top;
        clearTimeout(leaveT); wrap.classList.remove("spot--leave"); wrap.classList.add("spot--on");
        if (!raf) { raf = requestAnimationFrame(set); }
      });
      wrap.addEventListener("pointerleave", leave);
      wrap.addEventListener("focusin", function () { x = wrap.offsetWidth / 2; y = 0; set(); wrap.classList.add("spot--on"); });
      wrap.addEventListener("focusout", leave);
    });
  }

  function boot() {
    scan();
    bento();
    spotlight();
    var svc = document.querySelector("[data-services]");
    if (svc) { new MutationObserver(spotlight).observe(svc, { childList: true }); }
    var slider = document.querySelector("[data-slider]");
    if (slider) { new MutationObserver(scan).observe(slider, { childList: true }); }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(remeasure); }
    var w = window.innerWidth, t = 0;
    window.addEventListener("resize", function () {
      if (window.innerWidth === w) { return; }
      w = window.innerWidth; clearTimeout(t); t = setTimeout(remeasure, 150);
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }
})();
