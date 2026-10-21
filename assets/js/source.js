/* =========================================================================
   hybrid.cam v2, source browser
   Lists every file in both builds, loads it over fetch(), and offers
   source view / live preview / copy to clipboard / clear.
   ========================================================================= */

(function (H) {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function each(l, fn) { for (var i = 0; i < l.length; i++) { fn(i, l[i]); } }
  function on(n, t, fn) { if (n) { n.addEventListener(t, fn, false); } }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var TREE = [
    ["hybrid-cam-v2 · pages", [
      "index.html", "shop.html", "protocol.html", "inspection.html", "disputes.html",
      "track.html", "sellers.html", "payouts.html", "contact.html", "settings.html",
      "privacy.html", "terms.html", "login.html", "admin.html", "source.html", "404.html"
    ]],
    ["hybrid-cam-v2 · assets", [
      "assets/css/main.css", "assets/css/v2.css",
      "assets/js/main.js", "assets/js/v2.js", "assets/js/gate.js", "assets/js/admin.js", "assets/js/source.js",
      "assets/favicon.svg", "assets/logo/hc-mark.svg", "assets/logo/hc-symbol.svg", "assets/logo/hc-symbol-mono.svg"
    ]],
    ["hybrid-cam-v2 · meta", ["robots.txt", "sitemap.xml", "site.webmanifest", "render.yaml"]]
  ];

  function label(path) { return path.replace("../hybrid-cam-v1/", "v1/"); }
  function isHtml(path) { return /\.html?$/i.test(path); }

  function boot() {
    var tree = $("[data-tree]");
    if (!tree) { return; }

    var html = "";
    each(TREE, function (_, group) {
      html += '<p class="tree__group">' + esc(group[0]) + "</p>";
      each(group[1], function (__, path) {
        html += '<button class="tree__btn" type="button" data-file="' + esc(path) + '">' + esc(label(path)) + "</button>";
      });
    });
    tree.innerHTML = html;

    var codeEl = $("[data-code]"), frame = $("[data-frame]"), pathEl = $("[data-path]"),
        statusEl = $("[data-status]"), pad = $("[data-pad]"), current = { path: "", text: "" };

    function status(msg, kind) {
      statusEl.textContent = msg;
      statusEl.className = "viewer__status" + (kind ? " viewer__status--" + kind : "");
    }

    function showSource() {
      codeEl.hidden = false;
      frame.hidden = true;
      $("[data-mode-source]").classList.add("btn--primary");
      $("[data-mode-preview]").classList.remove("btn--primary");
    }
    function showPreview() {
      if (!isHtml(current.path)) {
        status("Preview is only available for HTML pages.", "warn");
        return;
      }
      frame.src = current.path;
      codeEl.hidden = true;
      frame.hidden = false;
      $("[data-mode-preview]").classList.add("btn--primary");
      $("[data-mode-source]").classList.remove("btn--primary");
    }

    function load(path, btn) {
      each($$("[data-file]", tree), function (_, b) { b.classList.remove("tree__btn--active"); });
      if (btn) { btn.classList.add("tree__btn--active"); }
      pathEl.textContent = label(path);
      current.path = path;
      status("Loading " + label(path) + " …");
      codeEl.textContent = "";
      showSource();

      window.fetch(path, { cache: "no-store" }).then(function (res) {
        if (!res.ok) { throw new Error(res.status + " " + res.statusText); }
        return res.text();
      }).then(function (text) {
        current.text = text;
        codeEl.textContent = text;
        var lines = text.split("\n").length;
        status(lines.toLocaleString() + " lines · " + text.length.toLocaleString() + " characters · ready to copy", "ok");
      }).catch(function (err) {
        current.text = "";
        codeEl.textContent = "";
        status("Could not read this file (" + err.message + "). Serve the folder over http://, file:// blocks reads.", "warn");
      });
    }

    each($$("[data-file]", tree), function (_, b) {
      on(b, "click", function () { load(b.getAttribute("data-file"), b); });
    });

    on($("[data-mode-source]"), "click", showSource);
    on($("[data-mode-preview]"), "click", showPreview);

    on($("[data-copy-file]"), "click", function () {
      var btn = this;
      if (!current.text) { status("Nothing loaded to copy yet.", "warn"); return; }
      H.copyText(current.text).then(function (ok) {
        btn.textContent = ok ? "Copied ✓" : "Copy blocked";
        status(ok ? "Copied " + label(current.path) + " to the clipboard." : "The browser blocked the clipboard, select the code and copy manually.", ok ? "ok" : "warn");
        window.setTimeout(function () { btn.textContent = "Copy file"; }, 2000);
      });
    });

    on($("[data-copy-pad]"), "click", function () {
      var btn = this;
      H.copyText(pad.value).then(function (ok) {
        btn.textContent = ok ? "Copied ✓" : "Copy blocked";
        window.setTimeout(function () { btn.textContent = "Copy notes"; }, 2000);
      });
    });

    on($("[data-send-pad]"), "click", function () {
      if (!current.text) { status("Load a file first.", "warn"); return; }
      pad.value += (pad.value ? "\n\n/* ---- " + label(current.path) + " ---- */\n" : "/* ---- " + label(current.path) + " ---- */\n") + current.text;
      status("Appended " + label(current.path) + " to the scratchpad.", "ok");
    });

    on($("[data-clear-view]"), "click", function () {
      codeEl.textContent = "";
      frame.removeAttribute("src");
      pathEl.textContent = "No file selected";
      current = { path: "", text: "" };
      each($$("[data-file]", tree), function (_, b) { b.classList.remove("tree__btn--active"); });
      status("Viewer cleared.");
    });

    on($("[data-clear-pad]"), "click", function () {
      pad.value = "";
      status("Scratchpad cleared.");
    });

    /* preselect the landing page so the panel is never empty */
    var first = $("[data-file]", tree);
    if (first) { load(first.getAttribute("data-file"), first); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, false);
  } else {
    boot();
  }
})(window.HYBRID = window.HYBRID || {});
