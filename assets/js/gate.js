/* =========================================================================
   hybrid.cam v2, static access gate
   Any page carrying <body data-protected="…"> is held until a staff session
   exists in sessionStorage; otherwise the visitor is sent to login.html with
   a ?next= return path. login.html itself calls Gate.signIn().
   Design build only, credentials are client-side fixtures, never real auth.
   ========================================================================= */

(function (H) {
  "use strict";

  var KEY = "hc-staff-session";
  var ACCOUNTS = [
    { user: "ops@hybrid.cam", pass: "hybrid2026", name: "Rain Villanueva", role: "Operations lead", scope: "admin,source" },
    { user: "dev@hybrid.cam", pass: "review2026", name: "Build reviewer", role: "Engineering", scope: "source" },
    { user: "admin", pass: "admin1234", name: "Administrator", role: "Business owner", scope: "admin,source" }
  ];

  function read() {
    try { return JSON.parse(window.sessionStorage.getItem(KEY) || "null"); }
    catch (e) { return null; }
  }
  function write(v) {
    try {
      if (v === null) { window.sessionStorage.removeItem(KEY); }
      else { window.sessionStorage.setItem(KEY, JSON.stringify(v)); }
    } catch (e) { /* private mode, session simply will not persist */ }
  }

  var Gate = {
    session: read,
    signOut: function (to) {
      write(null);
      window.location.href = to || "login.html";
    },
    signIn: function (user, pass) {
      var hit = null;
      for (var i = 0; i < ACCOUNTS.length; i++) {
        if (ACCOUNTS[i].user === user.trim().toLowerCase() && ACCOUNTS[i].pass === pass) { hit = ACCOUNTS[i]; }
      }
      if (!hit) { return null; }
      var s = { user: hit.user, name: hit.name, role: hit.role, scope: hit.scope, at: Date.now() };
      write(s);
      return s;
    },
    /* called by protected pages before they render their content: the page
       stays put and the credential prompt validates in place. */
    require: function (scope) {
      var s = read();
      if (s && (!scope || s.scope.indexOf(scope) !== -1)) { return s; }
      openPrompt(window.location.pathname.split("/").pop() || "index.html", scope, !!s);
      return null;
    }
  };

  var PROTECTED = ["admin.html", "source.html"];
  var needed = "admin";

  function each(list, fn) { for (var i = 0; i < list.length; i++) { fn(list[i]); } }

  function isProtectedHref(href) {
    if (!href) { return false; }
    var file = href.split("#")[0].split("?")[0].split("/").pop();
    for (var i = 0; i < PROTECTED.length; i++) { if (file === PROTECTED[i]) { return true; } }
    return false;
  }

  function buildPrompt() {
    var box = document.createElement("div");
    box.className = "gatebox";
    box.setAttribute("data-gatebox", "");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-labelledby", "gatebox-title");
    box.innerHTML = '' +
      '<div class="gatebox__backdrop" data-gatebox-close></div>' +
      '<div class="gatebox__dialog">' +
        '<button class="gatebox__close" type="button" data-gatebox-close aria-label="Close sign-in">&times;</button>' +
        '<span class="badge badge--gold">Restricted</span>' +
        '<h2 class="gatebox__title" id="gatebox-title">Admin credentials required</h2>' +
        '<p class="gatebox__lede">The pages under Company are staff-only. Sign in to continue.</p>' +
        '<form class="gatebox__form" data-gatebox-form novalidate>' +
          '<p class="field"><label class="field__label" for="gb-user">Username or work email</label>' +
            '<input class="field__control" id="gb-user" type="text" autocomplete="username" required /></p>' +
          '<p class="field"><label class="field__label" for="gb-pass">Password</label>' +
            '<input class="field__control" id="gb-pass" type="password" autocomplete="current-password" required /></p>' +
          '<p class="field__error" data-gatebox-error tabindex="-1" hidden>Those credentials do not match a staff account.</p>' +
          '<button class="btn btn--primary btn--block" type="submit">Sign in &amp; continue</button>' +
        "</form>" +
        '<p class="gatebox__hint">Hint for this build, username: admin · password: admin1234</p>' +
        '<p class="field__hint">Or open the full sign-in page: <a href="login.html">login.html</a></p>' +
      "</div>";
    document.body.appendChild(box);
    return box;
  }

  var promptBox = null, target = "admin.html", lastFocus = null, blocking = false;

  function openPrompt(href, scope, denied) {
    if (!promptBox) {
      promptBox = buildPrompt();
      promptBox.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-gatebox-close")) { closePrompt(); }
      }, false);
      promptBox.querySelector("[data-gatebox-form]").addEventListener("submit", function (e) {
        e.preventDefault();
        var err = promptBox.querySelector("[data-gatebox-error]");
        var s = Gate.signIn(promptBox.querySelector("#gb-user").value, promptBox.querySelector("#gb-pass").value);
        if (!s || (blocking && s.scope.indexOf(needed) === -1)) {
          err.hidden = false;
          err.textContent = s ? "That account cannot open this page." : "Those credentials do not match a staff account.";
          err.focus();
          return;
        }
        err.hidden = true;
        if (blocking) { window.location.reload(); } else { window.location.href = target; }
      }, false);
    }
    target = href;
    needed = scope || (href.indexOf("admin") > -1 ? "admin" : "source");
    if (denied) {
      var e2 = promptBox.querySelector("[data-gatebox-error]");
      e2.hidden = false;
      e2.textContent = "That account cannot open this page. Sign in with one that can.";
    }
    /* on a protected page the prompt is the only way forward: no dismissing */
    if (blocking) {
      each(promptBox.querySelectorAll("[data-gatebox-close]"), function (n) { n.removeAttribute("data-gatebox-close"); });
      promptBox.querySelector(".gatebox__close").hidden = true;
      promptBox.querySelector(".gatebox__lede").textContent =
        "This page is staff-only. Enter admin credentials to continue.";
    }
    lastFocus = document.activeElement;
    promptBox.classList.add("gatebox--open");
    promptBox.querySelector("#gb-user").focus();
  }
  function closePrompt() {
    if (!promptBox) { return; }
    promptBox.classList.remove("gatebox--open");
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  Gate.intercept = function () {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || !isProtectedHref(a.getAttribute("href"))) { return; }
      var s = read();
      if (s && s.scope.indexOf(a.getAttribute("href").indexOf("admin") > -1 ? "admin" : "source") !== -1) { return; }
      e.preventDefault();
      openPrompt(a.getAttribute("href"));
    }, false);
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.keyCode === 27) && promptBox && promptBox.classList.contains("gatebox--open")) { closePrompt(); }
    }, false);
  };

  H.gate = Gate;

  function boot() {
    Gate.intercept();
    var scope = document.body.getAttribute("data-protected");
    if (!scope) { return; }
    blocking = true;
    var s = Gate.require(scope);
    if (!s) { return; }

    document.body.removeAttribute("hidden");
    var shell = document.querySelector("[data-gate-shell]");
    if (shell) { shell.hidden = false; }

    var who = document.querySelector("[data-gate-who]");
    if (who) { who.textContent = s.name + " · " + s.role; }
    var out = document.querySelector("[data-gate-out]");
    if (out) {
      out.addEventListener("click", function () { Gate.signOut("login.html"); }, false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, false);
  } else {
    boot();
  }
})(window.HYBRID = window.HYBRID || {});
