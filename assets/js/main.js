/* hybrid.cam site behaviour, shared by every page (vanilla JS, no dependencies).
   Partials (header, crumbs, footer, back-to-top, cookie dialog) come from one source;
   body[data-page] drives the active nav item and the breadcrumb trail. */

window.HYBRID = window.HYBRID || {};

(function (H) {
  "use strict";

  /* ------------------------------------------------------------- DOM utils */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function each(list, fn) { for (var i = 0; i < list.length; i++) { fn(i, list[i]); } }
  function on(node, type, fn) { if (node) { node.addEventListener(type, fn, false); } }
  function delegate(type, sel, fn) {
    document.addEventListener(type, function (e) {
      var t = e.target && e.target.closest ? e.target.closest(sel) : null;
      if (t) { fn.call(t, e); }
    }, false);
  }
  function setText(sel, txt) { each($$(sel), function (_, n) { n.textContent = txt; }); }
  function setHtml(sel, html) { each($$(sel), function (_, n) { n.innerHTML = html; }); }
  function scrollY() { return window.pageYOffset || document.documentElement.scrollTop || 0; }

  /* ---------------------------------------------------------------- config */
  H.nav = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "shop", label: "Inventory", href: "shop.html" },
    { id: "protocol", label: "Escrow Protocol", href: "protocol.html" },
    { id: "track", label: "Track Order", href: "track.html" },
    { id: "sellers", label: "For Sellers", href: "sellers.html" }
  ];

  /* desktop header: three top-level items, "Trust" collapses two pages into a
     dropdown so the bar stays uncrowded. Home lives on the logo; the drawer
     keeps the full flat list. */
  H.menu = [
    { id: "shop", label: "Inventory", href: "shop.html" },
    {
      id: "trust", label: "Trust", children: [
        { id: "protocol", label: "Escrow Protocol", note: "The seven checkpoints", href: "protocol.html" },
        { id: "track", label: "Track Order", note: "Live order timeline", href: "track.html" }
      ]
    },
    { id: "sellers", label: "For Sellers", href: "sellers.html" }
  ];

  H.data = {
    products: [
      { id: "r50", name: "Canon EOS R50", spec: "24.2 MP · 4K30 · SC 1,204", price: "\u20b136,000", seller: "ProGear PH", condition: "MINT \u00b7 VERIFIED", cat: "mirrorless", slot: "[ product shot \u00b7 body + kit lens, 4:3 ]", serial: "062XXXXX0913", shutter: "1,204 actuations", warranty: "Local warranty until Mar 2027" },
      { id: "xs10", name: "Fujifilm X-S10", spec: "26.1 MP · IBIS · SC 4,820", price: "\u20b144,000", seller: "FujiVault", condition: "LIKE NEW", cat: "mirrorless", slot: "[ product shot \u00b7 body, 4:3 ]", serial: "1AQ2XXXX4471", shutter: "4,820 actuations", warranty: "Seller-backed 30 days" },
      { id: "zv1", name: "Sony ZV-1", spec: "20.1 MP · 1\" sensor · vlog", price: "\u20b124,500", seller: "Cubao Optics", condition: "GOOD \u00b7 VERIFIED", cat: "digicam", slot: "[ product shot \u00b7 compact digicam, 4:3 ]", serial: "39XXXX882", shutter: "Not applicable", warranty: "Seller-backed 14 days" },
      { id: "zfc", name: "Nikon Z fc + 28mm", spec: "20.9 MP · retro body · SC 900", price: "\u20b152,000", seller: "Manila Camera Lab", condition: "MINT \u00b7 VERIFIED", cat: "mirrorless", slot: "[ product shot \u00b7 retro body, 4:3 ]", serial: "60XXXXX113", shutter: "900 actuations", warranty: "Local warranty until Aug 2027" },
      { id: "ixus", name: "Canon IXUS 190", spec: "20 MP · 10x zoom · CCD look", price: "\u20b16,800", seller: "Y2K Optics MNL", condition: "GOOD", cat: "digicam", slot: "[ product shot \u00b7 pocket digicam, 4:3 ]", serial: "01XXXX447", shutter: "Not applicable", warranty: "Inspection pass only" },
      { id: "sigma30", name: "Sigma 30mm f/1.4 DC", spec: "APS-C prime · no fungus", price: "\u20b19,900", seller: "Glass Bank PH", condition: "MINT", cat: "glass", slot: "[ product shot \u00b7 prime lens, 4:3 ]", serial: "52XXXXX20", shutter: "Not applicable", warranty: "Inspection pass only" }
    ],

    steps: [
      {
        code: "01", title: "Order & address", role: "Buyer", badge: "Done",
        body: "The buyer confirms the exact unit and drops a delivery address into the order, never into a chat thread. The address stays masked to the seller until a rider is assigned.",
        guarantee: "Address is tokenised; only the assigned rider sees the full line.",
        facts: [["Order id", "HC-24817-MNL"], ["Unit", "Canon EOS R50 + RF-S 18-45mm"], ["Drop-off", "Masked until rider assignment"], ["Payment", "Nothing charged yet"]]
      },
      {
        code: "02", title: "Seller confirmation", role: "Seller", badge: "Done",
        body: "The seller locks the unit against the order, uploads serial and shutter count, and picks a geofenced meet point. Once locked, the listing goes dark to other buyers.",
        guarantee: "A serial mismatch at inspection voids the sale, not the buyer's money.",
        facts: [["Serial logged", "062XXXXX0913"], ["Shutter count", "1,204 actuations"], ["Meet point", "San Miguel, Manila"], ["Listing state", "Locked \u00b7 hidden"]]
      },
      {
        code: "03", title: "Delivery booking", role: "Platform", badge: "Done",
        body: "Instead of paying the seller up front, the buyer books an on-demand rider through the order. Funds move into escrow at this moment, the seller can see they exist, but cannot touch them.",
        guarantee: "Escrow funded before dispatch. The rider fee is quoted, not estimated.",
        facts: [["Courier", "On-demand partner rider"], ["Rider fee", "\u20b1180 \u00b7 quoted upfront"], ["Escrow", "\u20b136,000 held"], ["Dispatch", "Assigned in 3 min"]]
      },
      {
        code: "04", title: "Item verification", role: "Rider + both parties", badge: "Live",
        body: "At the seller's door the rider opens a three-way call and runs the checklist on camera: power on, shutter fire, sensor and glass check, dials and buttons, card slot, battery seat. The clip attaches to the order.",
        guarantee: "A failed item never leaves the seller, escrow refunds within 24 hours.",
        facts: [["Call state", "Buyer + seller + rider live"], ["Checklist", "9 of 12 signed"], ["Evidence", "Video clip attached to order"], ["If it fails", "Auto-cancel, full refund"]]
      },
      {
        code: "05", title: "Pickup", role: "Rider", badge: "Queued",
        body: "Handoff happens at the agreed point, San Miguel, Manila, near Arellano School. The rider seals the unit in tamper-evident packaging and scans the seal code into the order.",
        guarantee: "Seal code recorded at both ends. A broken seal is the courier's liability.",
        facts: [["Meet point", "Arellano School, San Miguel"], ["Seal code", "TS-4491-A"], ["Packaging", "Tamper-evident, padded"], ["Photo proof", "Sealed unit + odometer"]]
      },
      {
        code: "06", title: "Delivery", role: "Rider", badge: "Queued",
        body: "The unit travels to the buyer's address with live tracking. Location sharing between all three parties expires fifteen minutes after handoff.",
        guarantee: "Insured in transit up to the escrowed value of the unit.",
        facts: [["Tracking", "Live, buyer-visible"], ["Transit cover", "Up to \u20b136,000"], ["Handover", "OTP at the door"], ["Sharing", "Expires after 15 min"]]
      },
      {
        code: "07", title: "Transaction completed", role: "Escrow", badge: "Pending",
        body: "The buyer confirms the seal is intact and the OTP releases escrow to the seller. Warranty window, inspection clip and serial stay filed against both accounts.",
        guarantee: "48-hour dispute window on anything the checklist could not catch.",
        facts: [["Payout", "Released to seller"], ["Buyer record", "Serial + clip archived"], ["Dispute window", "48 hours"], ["Seller score", "+1 cleared sale"]]
      }
    ]
  };

  /* -------------------------------------------------------------- partials */
  /* 24px stroke icons; the same paths ship as files in assets/icons/ */
  var IC = {
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    scan: '<path d="M4 8V5h4"/><path d="M16 4h4v4"/><path d="M20 16v4h-4"/><path d="M8 20H4v-4"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    scale: '<path d="M12 4v16"/><path d="M8 20h8"/><path d="M5 7h14"/><path d="M5 7l-3 6h6z"/><path d="M19 7l-3 6h6z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M5 9v11h14V9"/><path d="M4 9h16"/><path d="M10 20v-6h4v6"/>',
    wallet: '<path d="M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4z"/><path d="M4 7V5.5A1.5 1.5 0 0 1 5.5 4H17"/><path d="M15.5 13.5h1"/>',
    chat: '<path d="M5 5h14v10H10l-5 4z"/><path d="M9 10h6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3"/><path d="M12 18.5v3"/><path d="M5.3 5.3l2.1 2.1"/><path d="M16.6 16.6l2.1 2.1"/><path d="M2.5 12h3"/><path d="M18.5 12h3"/><path d="M5.3 18.7l2.1-2.1"/><path d="M16.6 7.4l2.1-2.1"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    code: '<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M13.5 5l-3 14"/>',
    cookie: '<path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-5-5 4 4 0 0 1-4-4z"/><path d="M8.5 10.5v.01"/><path d="M15.5 15.5v.01"/><path d="M10.5 16v.01"/>',
    doc: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 13h6"/><path d="M9 17h6"/>',
    up: '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
    back: '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    chevD: '<path d="M6 9l6 6 6-6"/>',
    close: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'
  };
  function icon(name, size) {
    var s = size || 20;
    return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (IC[name] || "") + "</svg>";
  }
  H.icon = icon;

  /* the lens-c monogram, drawn on its pink tile */
  function mark(size) {
    var s = size || 36;
    return '<svg class="logo__svg" width="' + s + '" height="' + s + '" viewBox="0 0 256 256" aria-hidden="true" focusable="false">' +
      '<rect width="256" height="256" rx="56" fill="#ee5a92"/>' +
      '<g transform="translate(25.6 25.6) scale(.8)"><path d="M193.5 82.1A80 80 0 1 0 193.5 173.9" fill="none" stroke="#0a1128" stroke-width="36"/><circle cx="128" cy="128" r="26" fill="#0a1128"/></g></svg>';
  }
  H.mark = mark;

  function logo() {
    return '<a class="logo" href="index.html" aria-label="hybrid.cam, home">' + mark(36) +
      '<span class="logo__text">hybrid<span class="logo__text-accent">.cam</span></span></a>';
  }

  /* every page that exists, so menus, footer and crumbs share one source */
  H.pages = {
    home: { label: "Home", href: "index.html" },
    shop: { label: "Inventory", href: "shop.html" },
    protocol: { label: "Escrow protocol", href: "protocol.html", parent: null },
    inspection: { label: "Inspection checklist", href: "inspection.html", parent: "protocol" },
    disputes: { label: "Dispute window", href: "disputes.html", parent: "protocol" },
    track: { label: "Track order", href: "track.html" },
    sellers: { label: "For sellers", href: "sellers.html" },
    payouts: { label: "Payout schedule", href: "payouts.html", parent: "sellers" },
    contact: { label: "Contact support", href: "contact.html" },
    settings: { label: "Settings", href: "settings.html" },
    privacy: { label: "Privacy policy", href: "privacy.html" },
    terms: { label: "Terms and conditions", href: "terms.html" },
    admin: { label: "Admin console", href: "admin.html" },
    source: { label: "Source files", href: "source.html" },
    login: { label: "Staff sign-in", href: "login.html" },
    "404": { label: "Page not found", href: "404.html" }
  };

  H.cats = { mirrorless: "Mirrorless bodies", digicam: "Digicams", glass: "Lenses and glass" };

  function currentCat() {
    var m = /[?&]cat=([a-z]+)/.exec(window.location.search || "");
    return m && H.cats[m[1]] ? m[1] : "";
  }
  H.currentCat = currentCat;

  H.partials = {
    header: function (page) {
      var links = "", drawer = "";
      each(H.menu, function (_, n) {
        if (!n.children) {
          var on = n.id === page;
          links += '<li class="nav__item"><a class="nav__link' + (on ? " nav__link--active" : "") + '" href="' + n.href + '"' + (on ? ' aria-current="page"' : "") + ">" + n.label + "</a></li>";
          drawer += '<li class="drawer__item"><a class="drawer__link' + (on ? " drawer__link--active" : "") + '" href="' + n.href + '"' + (on ? ' aria-current="page"' : "") + ">" + icon(n.icon, 20) + "<span>" + n.label + "</span></a></li>";
          return;
        }
        var kids = "", dkids = "", holds = false;
        each(n.children, function (__, c) {
          var kon = c.id === page;
          if (kon) { holds = true; }
          kids += '<li class="nav__menu-item"><a class="nav__menu-link' + (kon ? " nav__menu-link--active" : "") + '" href="' + c.href + '"' + (kon ? ' aria-current="page"' : "") + ">" +
                  '<span class="nav__menu-icon">' + icon(c.icon, 20) + "</span>" +
                  '<span class="nav__menu-text"><span class="nav__menu-label">' + c.label + "</span>" +
                  '<span class="nav__menu-note">' + c.note + "</span></span></a></li>";
          dkids += '<li class="drawer__item"><a class="drawer__link drawer__link--sub' + (kon ? " drawer__link--active" : "") + '" href="' + c.href + '"' + (kon ? ' aria-current="page"' : "") + ">" + icon(c.icon, 20) +
                   '<span class="drawer__text"><span>' + c.label + '</span><span class="drawer__note">' + c.note + "</span></span></a></li>";
        });
        links += '<li class="nav__item nav__item--menu">' +
            '<button class="nav__link nav__link--toggle' + (holds ? " nav__link--active" : "") + '" type="button" data-nav-menu aria-expanded="false" aria-controls="nav-menu-' + n.id + '">' +
              n.label + icon("chevD", 16) + "</button>" +
            '<ul class="nav__menu" id="nav-menu-' + n.id + '" aria-label="' + n.label + '">' + kids + "</ul>" +
          "</li>";
        drawer += '<li class="drawer__group"><p class="drawer__heading" id="drawer-' + n.id + '">' + n.label + '</p><ul class="drawer__sublist" aria-labelledby="drawer-' + n.id + '">' + dkids + "</ul></li>";
      });

      return '' +
        '<header class="header" id="site-header">' +
          '<div class="header__inner">' + logo() +
            '<nav class="nav" aria-label="Main"><ul class="nav__list">' + links + '</ul></nav>' +
            '<div class="header__actions">' +
              '<a class="btn btn--primary btn--sm" href="shop.html">Browse units</a>' +
              H.partials.themeToggle() +
              '<button class="burger" type="button" aria-expanded="false" aria-controls="site-drawer" aria-label="Open menu">' +
                '<span class="burger__open">' + icon("menu", 20) + '</span><span class="burger__close">' + icon("close", 20) + '</span><span class="burger__label" aria-hidden="true">Menu</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<nav class="drawer" id="site-drawer" aria-label="Main">' +
            '<ul class="drawer__list">' + drawer + '</ul>' +
            '<div class="drawer__actions">' +
              '<a class="btn btn--ghost btn--block" href="track.html">Track an order</a>' +
              '<a class="btn btn--primary btn--block" href="shop.html">Browse units</a>' +
            '</div>' +
          '</nav>' +
        '</header>' +
        '<div class="header-spacer" aria-hidden="true"></div>' +
        '<div class="drawer-backdrop" data-drawer-close aria-hidden="true"></div>';
    },

    crumbs: function (page) {
      var p = H.pages[page];
      if (!p || page === "home") { return ""; }
      var trail = [{ label: "Home", href: "index.html" }];
      if (p.parent && H.pages[p.parent]) { trail.push({ label: H.pages[p.parent].label, href: H.pages[p.parent].href }); }
      var cat = page === "shop" ? currentCat() : "";
      if (cat) {
        trail.push({ label: p.label, href: p.href });
        trail.push({ label: H.cats[cat] });
      } else {
        trail.push({ label: p.label });
      }
      var items = "";
      each(trail, function (i, t) {
        var sep = i ? '<span class="crumbs__sep">' + icon("chevR", 12) + "</span>" : "";
        items += '<li class="crumbs__item">' + sep +
          (t.href ? '<a class="crumbs__link" href="' + t.href + '">' + t.label + "</a>" : '<span class="crumbs__current" aria-current="page">' + t.label + "</span>") +
          "</li>";
      });
      return '<div class="crumbs"><div class="crumbs__inner">' +
        '<button class="crumbs__back" type="button" data-crumbs-back aria-label="Go back" title="Go back">' + icon("back", 18) + "</button>" +
        '<nav class="crumbs__nav" aria-label="Breadcrumb"><ol class="crumbs__list">' + items + "</ol></nav>" +
        "</div></div>";
    },

    footer: function () {
      var cols = [
        ["Marketplace", [["Browse inventory", "shop.html"], ["Mirrorless bodies", "shop.html?cat=mirrorless"], ["Digicams", "shop.html?cat=digicam"], ["Lenses and glass", "shop.html?cat=glass"]]],
        ["Trust", [["Escrow protocol", "protocol.html"], ["Inspection checklist", "inspection.html"], ["Dispute window", "disputes.html"], ["Track an order", "track.html"]]],
        ["Sellers", [["For sellers", "sellers.html"], ["Payout schedule", "payouts.html"], ["Contact support", "contact.html"], ["Settings", "settings.html"]]]
      ];
      var colHtml = "";
      each(cols, function (i, c) {
        var items = "";
        each(c[1], function (__, l) { items += '<li class="footer__item"><a class="footer__link" href="' + l[1] + '">' + l[0] + "</a></li>"; });
        colHtml += '<nav class="footer__col" aria-labelledby="ft-' + i + '"><h2 class="footer__col-title" id="ft-' + i + '">' + c[0] + '</h2><ul class="footer__list">' + items + "</ul></nav>";
      });

      return '' +
        '<footer class="footer" id="site-footer">' +
          '<div class="l-wrap footer__wrap">' +
            '<button class="to-top to-top--docked" type="button" data-to-top aria-label="Back to top">' + icon("up", 20) + "</button>" +
            '<div class="footer__top">' +
              '<div class="footer__brand">' + logo() +
                '<p class="footer__brand-copy">Escrowed peer-to-peer camera trading in Metro Manila. A rider inspects every unit on camera, and the seller is paid only after the checklist passes.</p>' +
                '<p class="footer__contact"><a class="footer__link footer__link--icon" href="mailto:hello@hybrid.cam">' + icon("mail", 16) + 'hello@hybrid.cam</a></p>' +
              '</div>' + colHtml +
            '</div>' +
            '<div class="footer__bottom">' +
              '<p class="footer__meta">\u00a9 2026 hybrid.cam \u00b7 <span class="footer__ver">v2.1.0</span> \u00b7 Manila, Philippines</p>' +
              '<nav class="footer__legal" aria-label="Legal">' +
                '<a class="footer__legal-link" href="privacy.html">' + icon("shield", 16) + "Privacy policy</a>" +
                '<button class="footer__legal-link" type="button" data-open-cookies>' + icon("cookie", 16) + "Cookie settings</button>" +
                '<a class="footer__legal-link" href="terms.html">' + icon("doc", 16) + "Terms and conditions</a>" +
              "</nav>" +
            '</div>' +
          '</div>' +
        '</footer>';
    },

    themeToggle: function () {
      return '' +
        '<button class="theme-toggle" type="button" data-theme-toggle data-mode="dark" aria-label="Switch to light mode">' +
          '<span class="theme-toggle__icon" aria-hidden="true"></span>' +
          '<span class="theme-toggle__label">Light mode</span>' +
        '</button>';
    },

    toTop: function () {
      return '<button class="to-top to-top--floating" id="to-top" type="button" data-to-top aria-label="Back to top" tabindex="-1" aria-hidden="true">' + icon("up", 20) + "</button>";
    },

    cookies: function () {
      return '' +
        '<div class="cookies" data-cookies hidden>' +
          '<div class="cookies__backdrop" data-cookies-close></div>' +
          '<div class="cookies__dialog" role="dialog" aria-modal="true" aria-labelledby="ck-title" aria-describedby="ck-desc" tabindex="-1">' +
            '<div class="cookies__head"><h2 class="cookies__title" id="ck-title">Cookie settings</h2>' +
              '<button class="cookies__x" type="button" data-cookies-close aria-label="Close cookie settings">' + icon("close", 20) + "</button></div>" +
            '<p class="cookies__desc" id="ck-desc">hybrid.cam sets no tracking or advertising cookies. It keeps a few items in this browser so the site works the way you left it. Choose what it may keep.</p>' +
            '<div class="cookies__opts">' +
              '<label class="cookies__opt" for="ck-essential"><input type="checkbox" id="ck-essential" checked disabled /><span><span class="cookies__name">Essential, always on</span><span class="cookies__note">Remembers these choices and your staff sign-in for the current tab.</span></span></label>' +
              '<label class="cookies__opt" for="ck-prefs"><input type="checkbox" id="ck-prefs" data-ck="prefs" /><span><span class="cookies__name">Display settings</span><span class="cookies__note">Theme and motion. Turning this off deletes the saved copy.</span></span></label>' +
              '<label class="cookies__opt" for="ck-offers"><input type="checkbox" id="ck-offers" data-ck="offers" /><span><span class="cookies__name">Offer reminders</span><span class="cookies__note">Remembers that you closed the rewards popup so it stays closed.</span></span></label>' +
            "</div>" +
            '<div class="cookies__actions">' +
              '<button class="btn btn--primary" type="button" data-cookies-save>Save choices</button>' +
              '<button class="btn btn--ghost" type="button" data-cookies-close>Cancel</button>' +
              '<a class="cookies__link" href="privacy.html">Privacy policy</a>' +
            "</div>" +
          "</div>" +
        "</div>";
    },

    toast: function () {
      return '<div class="toast" data-toast role="status" aria-live="polite"></div>';
    },
    marquee: function () {
      var items = ["Canon", "Fujifilm", "Sony", "Nikon", "Panasonic", "Digicams", "Vintage glass", "Verified sellers"];
      var group = '<div class="marquee__group" aria-hidden="false"><span class="marquee__item">';
      each(items, function (i, t) {
        group += t + '<span class="marquee__sep' + (i % 2 ? " marquee__sep--gold" : "") + '">\u25c6</span>';
      });
      group += "</span></div>";
      /* two identical groups + translate3d(-50%) = seamless, gapless loop */
      /* one group is the seed; H.modules.marquee repeats it until each half of
         the track is wider than the viewport, so translate3d(-50%) never shows a gap */
      return '<div class="marquee" data-marquee data-marquee-group="' + encodeURIComponent(group) + '">' +
             '<div class="marquee__track">' + group + group + "</div></div>";
    }
  };

  /* ------------------------------------------------- storage and consent */
  var THEME_KEY = "hc-theme", MOTION_KEY = "hc-motion", CONSENT_KEY = "hc-consent";

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { window.localStorage.removeItem(k); } catch (e) {} }

  /* both optional groups default to on until the visitor says otherwise */
  H.consent = (function () {
    var c = { prefs: true, offers: true };
    try { var raw = JSON.parse(lsGet(CONSENT_KEY) || "null"); if (raw) { c.prefs = raw.prefs !== false; c.offers = raw.offers !== false; } } catch (e) {}
    return c;
  })();

  H.store = {
    get: lsGet,
    set: function (k, v) {
      if ((k === THEME_KEY || k === MOTION_KEY) && !H.consent.prefs) { return; }
      if (k.indexOf("hc-promo-") === 0 && !H.consent.offers) { return; }
      lsSet(k, v);
    },
    del: lsDel,
    saveConsent: function (c) {
      H.consent = { prefs: !!c.prefs, offers: !!c.offers };
      lsSet(CONSENT_KEY, JSON.stringify(H.consent));
      if (!H.consent.prefs) { lsDel(THEME_KEY); lsDel(MOTION_KEY); }
      if (!H.consent.offers) {
        try {
          for (var i = window.localStorage.length - 1; i >= 0; i--) {
            var key = window.localStorage.key(i);
            if (key && key.indexOf("hc-promo-") === 0) { window.localStorage.removeItem(key); }
          }
        } catch (e) {}
      }
    }
  };

  /* ----------------------------------------------------------------- theme */
  H.themePref = function () { var s = lsGet(THEME_KEY); return s === "light" || s === "dark" || s === "system" ? s : "light"; };

  function readTheme() {
    var stored = H.themePref();
    if (stored !== "system") { return stored; }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) { return "dark"; }
    return "light";
  }

  function paintTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var next = theme === "light" ? "dark" : "light";
    var meta = $('meta[name="theme-color"]');
    if (meta) { meta.setAttribute("content", theme === "light" ? "#f8f9fc" : "#0a1128"); }
    each($$("[data-theme-toggle]"), function (_, b) {
      b.setAttribute("data-mode", theme);
      /* the accessible name contains the visible label (WCAG 2.5.3) */
      b.setAttribute("aria-label", "Switch to " + next + " mode");
      var label = $(".theme-toggle__label", b);
      if (label) { label.textContent = next === "light" ? "Light mode" : "Dark mode"; }
    });
  }

  H.setTheme = function (pref) {
    H.store.set(THEME_KEY, pref);
    H.theme = pref === "system" ? readTheme() : pref;
    paintTheme(H.theme);
  };

  /* motion: "system" follows the OS, "reduce" stops looping animation site-wide */
  H.motionPref = function () { return lsGet(MOTION_KEY) === "reduce" ? "reduce" : "system"; };
  H.setMotion = function (pref) {
    if (pref === "reduce") { H.store.set(MOTION_KEY, "reduce"); } else { lsDel(MOTION_KEY); }
    document.documentElement.setAttribute("data-motion", pref);
  };
  H.reducedMotion = function () {
    return H.motionPref() === "reduce" || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  };

  /* set before first paint so the page never flashes the wrong theme */
  H.theme = readTheme();
  document.documentElement.setAttribute("data-theme", H.theme);
  document.documentElement.setAttribute("data-motion", H.motionPref());

  H.toast = function (msg) {
    var t = $("[data-toast]");
    if (!t) { return; }
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(H._toastT);
    H._toastT = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  };

  /* --------------------------------------------------------------- modules */
  H.modules = {
    layout: function () {
      var page = document.body.getAttribute("data-page") || "";
      setHtml('[data-partial="header"]', H.partials.header(page));
      setHtml('[data-partial="footer"]', H.partials.footer());
      setHtml('[data-partial="marquee"]', H.partials.marquee());
      var main = $("#main");
      if (main) {
        main.setAttribute("tabindex", "-1");
        var crumbs = H.partials.crumbs(page);
        if (crumbs) { main.insertAdjacentHTML("afterbegin", crumbs); }
      }
      if (!$("#to-top")) { document.body.insertAdjacentHTML("beforeend", H.partials.toTop()); }
      document.body.insertAdjacentHTML("beforeend", H.partials.cookies() + H.partials.toast());
    },

    marquee: function () {
      var mqs = $$("[data-marquee]");
      if (!mqs.length) { return; }

      function fill(mq) {
        var seed = decodeURIComponent(mq.getAttribute("data-marquee-group") || "");
        if (!seed) { return; }
        var track = $(".marquee__track", mq);
        if (!track) { return; }
        track.innerHTML = seed;
        var first = $(".marquee__group", track);
        var groupW = (first && first.getBoundingClientRect().width) || 1;
        var need = Math.max(2, Math.ceil((mq.getBoundingClientRect().width + 120) / groupW) + 1);
        var half = "";
        for (var n = 0; n < need; n++) { half += seed; }
        /* two identical halves → -50% lands exactly on a repeat boundary */
        track.innerHTML = half + half;
        /* constant, even pace at any width: 54 px per second across one half */
        track.style.animationDuration = ((groupW * need) / 54).toFixed(2) + "s";
      }

      function fillAll() { each(mqs, function (_, mq) { fill(mq); }); }
      fillAll();

      var t = null, w = window.innerWidth;
      on(window, "resize", function () {
        if (window.innerWidth === w) { return; }
        w = window.innerWidth;
        clearTimeout(t);
        t = setTimeout(fillAll, 200);
      });
    },

    drawer: function () {
      var lastFocus = null;
      function parts() { return { d: $("#site-drawer"), b: $(".burger"), k: $(".drawer-backdrop") }; }
      function setOpen(open, restore) {
        var p = parts();
        if (!p.d || !p.b) { return; }
        p.d.classList.toggle("is-open", open);
        if (p.k) { p.k.classList.toggle("is-open", open); }
        document.body.classList.toggle("is-drawer", open);
        p.b.setAttribute("aria-expanded", open ? "true" : "false");
        p.b.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        if (open) { lastFocus = document.activeElement; var f = $("a", p.d); if (f) { f.focus(); } }
        else if (restore && lastFocus && lastFocus.focus) { lastFocus.focus(); }
      }
      H.closeDrawer = function () { setOpen(false, false); };
      delegate("click", ".burger", function () { setOpen(this.getAttribute("aria-expanded") !== "true", true); });
      delegate("click", "[data-drawer-close]", function () { setOpen(false, true); });
      delegate("click", ".drawer a", function () { setOpen(false, false); });
      on(document, "keydown", function (e) {
        if ((e.key === "Escape" || e.keyCode === 27) && document.body.classList.contains("is-drawer")) { setOpen(false, true); }
      });
      on(window, "resize", function () { if (window.innerWidth > 1024) { setOpen(false, false); } });
    },

    /* Home: the header scrolls away with the hero, then drops back in fixed.
       Other pages: fixed from the start, a spacer holds its place. */
    header: function () {
      var header = $("#site-header");
      if (!header) { return; }
      var home = document.body.getAttribute("data-page") === "home";
      var hero = home ? $(".hero") : null;
      var root = document.documentElement, raf = null, wasFixed = null;
      function measure() { root.style.setProperty("--hdr-h", header.offsetHeight + "px"); }
      function update() {
        raf = null;
        var y = scrollY();
        var fixed = home ? !!hero && hero.getBoundingClientRect().bottom <= 0 : true;
        if (fixed !== wasFixed) {
          header.classList.toggle("header--fixed", fixed);
          root.classList.toggle("has-fixed-header", fixed);
          header.classList.toggle("header--drop", fixed && home && wasFixed === false && !H.reducedMotion());
          wasFixed = fixed;
        }
        header.classList.toggle("header--scrolled", home ? fixed : y > 8);
      }
      function queue() { if (!raf) { raf = (window.requestAnimationFrame || setTimeout)(update); } }
      measure();
      update();
      on(window, "scroll", queue);
      on(window, "resize", function () { measure(); queue(); });
    },

    /* floating button after 600px; hands over to the docked one when the footer shows */
    toTop: function () {
      var btn = $("#to-top"), footer = $("#site-footer"), raf = null;
      function update() {
        raf = null;
        if (!btn) { return; }
        var docked = !!footer && footer.getBoundingClientRect().top < window.innerHeight;
        var show = scrollY() > 600 && !docked;
        btn.classList.toggle("is-visible", show);
        btn.setAttribute("aria-hidden", show ? "false" : "true");
        btn.setAttribute("tabindex", show ? "0" : "-1");
      }
      function queue() { if (!raf) { raf = (window.requestAnimationFrame || setTimeout)(update); } }
      on(window, "scroll", queue);
      on(window, "resize", queue);
      update();
      delegate("click", "[data-to-top]", function () {
        var smooth = !H.reducedMotion();
        try { window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" }); } catch (e) { window.scrollTo(0, 0); }
        var main = $("#main");
        if (main) { try { main.focus({ preventScroll: true }); } catch (e2) { main.focus(); } }
      });
    },

    crumbs: function () {
      var back = $("[data-crumbs-back]");
      if (!back) { return; }
      var can = window.history.length > 1 && !!document.referrer;
      back.disabled = !can;
      on(back, "click", function () { if (can) { window.history.back(); } });
    },

    cookies: function () {
      var box = $("[data-cookies]");
      if (!box) { return; }
      var dialog = $(".cookies__dialog", box), lastFocus = null;
      function sync() {
        each($$("[data-ck]", box), function (_, i) { i.checked = !!H.consent[i.getAttribute("data-ck")]; });
      }
      function open() {
        if (H.closeDrawer) { H.closeDrawer(); }
        sync();
        lastFocus = document.activeElement;
        box.hidden = false;
        document.body.classList.add("is-locked");
        var first = $("#ck-prefs", box);
        if (first) { first.focus(); } else { dialog.focus(); }
      }
      function close() {
        box.hidden = true;
        document.body.classList.remove("is-locked");
        if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
      }
      H.openCookies = open;
      delegate("click", "[data-open-cookies]", function (e) { e.preventDefault(); open(); });
      delegate("click", "[data-cookies-close]", close);
      delegate("click", "[data-cookies-save]", function () {
        var c = {};
        each($$("[data-ck]", box), function (_, i) { c[i.getAttribute("data-ck")] = i.checked; });
        H.store.saveConsent(c);
        close();
        H.toast("Cookie choices saved.");
        if (H.onConsent) { H.onConsent(); }
      });
      on(document, "keydown", function (e) {
        if (box.hidden) { return; }
        if (e.key === "Escape" || e.keyCode === 27) { close(); return; }
        if (e.key !== "Tab") { return; }
        var f = $$("button:not([disabled]), input:not([disabled]), a[href]", dialog);
        if (!f.length) { return; }
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      });
    },

    settings: function () {
      var root = $("[data-settings]");
      if (!root) { return; }
      function paint() {
        var t = H.themePref(), m = H.motionPref();
        each($$('input[name="theme"]', root), function (_, i) { i.checked = i.value === t; });
        each($$('input[name="motion"]', root), function (_, i) { i.checked = i.value === m; });
        var note = $("[data-settings-keep]", root);
        if (note) {
          note.hidden = H.consent.prefs;
        }
        var staff = $("[data-settings-staff]", root), s = null;
        try { s = JSON.parse(window.sessionStorage.getItem("hc-staff-session") || "null"); } catch (e) {}
        if (staff) { staff.disabled = !s; }
      }
      H.onConsent = paint;
      delegate("change", '[data-settings] input[name="theme"]', function () {
        H.setTheme(this.value);
        H.toast(this.value === "system" ? "Theme follows your device." : (this.value === "light" ? "Light theme on." : "Dark theme on."));
      });
      delegate("change", '[data-settings] input[name="motion"]', function () {
        H.setMotion(this.value);
        H.toast(this.value === "reduce" ? "Animations reduced." : "Motion follows your device.");
      });
      delegate("click", "[data-settings-offer]", function () {
        try {
          for (var i = window.localStorage.length - 1; i >= 0; i--) {
            var key = window.localStorage.key(i);
            if (key && key.indexOf("hc-promo-") === 0) { window.localStorage.removeItem(key); }
          }
        } catch (e) {}
        H.toast("The rewards popup will show again on the home page.");
      });
      delegate("click", "[data-settings-staff]", function () {
        try { window.sessionStorage.removeItem("hc-staff-session"); } catch (e) {}
        paint();
        H.toast("Staff session ended in this tab.");
      });
      delegate("click", "[data-settings-clear]", function () {
        each([THEME_KEY, MOTION_KEY, CONSENT_KEY], function (_, k) { lsDel(k); });
        H.consent = { prefs: true, offers: true };
        H.store.saveConsent(H.consent);
        lsDel(CONSENT_KEY);
        H.setTheme("system");
        H.setMotion("system");
        paint();
        H.toast("Saved settings cleared.");
      });
      paint();
    },

    /* shop.html?cat=… pre-selects the category chip and names it in the heading */
    shopCat: function () {
      var cat = H.currentCat();
      if (!cat || document.body.getAttribute("data-page") !== "shop") { return; }
      var chip = $('[data-filter-chip="' + cat + '"]');
      if (chip) { setTimeout(function () { chip.click(); }, 0); }
      var h = $("[data-shop-title]");
      if (h) { h.textContent = H.cats[cat] + ", inspected before you pay."; }
      document.title = H.cats[cat] + " \u00b7 Inventory \u00b7 hybrid.cam";
    },

    reveal: function () {
      var items = $$(".reveal");
      if (!items.length) { return; }
      if (typeof window.IntersectionObserver === "function") {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
        each(items, function (_, n) { io.observe(n); });
      } else {
        var check = function () {
          var fold = scrollY() + window.innerHeight * 0.94;
          each($$(".reveal:not(.is-in)"), function (_, n) {
            if (n.getBoundingClientRect().top + scrollY() < fold) { n.classList.add("is-in"); }
          });
        };
        on(window, "scroll", check);
        on(window, "resize", check);
        check();
      }
    },

    stepper: function () {
      var rail = $("[data-stepper]");
      if (!rail) { return; }
      var steps = H.data.steps, i = parseInt(rail.getAttribute("data-start"), 10) || 0;

      var railHtml = "";
      each(steps, function (n, s) {
        railHtml += '' +
          '<li class="step"><button class="step__button" type="button" data-step="' + n + '">' +
            '<span class="step__index">' + s.code + "</span>" +
            '<span class="step__text"><span class="step__title">' + s.title + '</span><span class="step__role">' + s.role + "</span></span>" +
            '<span class="step__state' + (s.badge === "Live" ? " step__state--live" : "") + '">' + s.badge + "</span>" +
          "</button></li>";
      });
      rail.innerHTML = railHtml;

      function render() {
        var s = steps[i], facts = "";
        each(s.facts, function (_, f) {
          facts += '<div class="fact"><div class="fact__label">' + f[0] + '</div><div class="fact__value">' + f[1] + "</div></div>";
        });
        setText("[data-detail-kicker]", "Checkpoint " + s.code + " \u00b7 " + s.badge);
        setText("[data-detail-title]", s.title);
        setText("[data-detail-body]", s.body);
        setText("[data-detail-guarantee]", s.guarantee);
        setHtml("[data-detail-facts]", facts);
        each($$(".step__button", rail), function (_, b) {
          b.classList.remove("step__button--active");
          b.setAttribute("aria-current", "false");
        });
        var active = $('[data-step="' + i + '"]', rail);
        if (active) { active.classList.add("step__button--active"); active.setAttribute("aria-current", "step"); }
      }

      on(rail, "click", function (e) {
        var b = e.target.closest(".step__button");
        if (!b) { return; }
        i = parseInt(b.getAttribute("data-step"), 10);
        render();
      });
      delegate("click", "[data-step-prev]", function () { i = (i + steps.length - 1) % steps.length; render(); });
      delegate("click", "[data-step-next]", function () { i = (i + 1) % steps.length; render(); });
      render();
    },

    inventory: function () {
      var grid = $("[data-inventory]");
      if (!grid) { return; }
      var limit = parseInt(grid.getAttribute("data-limit"), 10) || 0;

      function cardHtml(p) {
        return '' +
          '<article class="card reveal" data-cat="' + p.cat + '">' +
            '<div class="card__media">' +
              '<span class="card__slot">' + p.slot + "</span>" +
              '<span class="badge badge--mint card__flag">' + p.condition + "</span>" +
            "</div>" +
            '<div class="card__body">' +
              '<h3 class="card__name">' + p.name + "</h3>" +
              '<p class="card__spec">' + p.spec + "</p>" +
              '<div class="card__price-row"><span class="card__price">' + p.price + '</span><span class="card__seller">' + p.seller + "</span></div>" +
              '<button class="btn btn--ghost btn--block" type="button" data-open-modal="' + p.id + '">Reserve with escrow</button>' +
            "</div>" +
          "</article>";
      }

      var list = limit ? H.data.products.slice(0, limit) : H.data.products;
      var html = "";
      each(list, function (_, p) { html += cardHtml(p); });
      grid.innerHTML = html;

      delegate("click", ".filter-bar__chip", function () {
        var cat = this.getAttribute("data-filter");
        each($$(".filter-bar__chip"), function (_, c) {
          c.classList.remove("filter-bar__chip--active");
          c.setAttribute("aria-pressed", "false");
        });
        this.classList.add("filter-bar__chip--active");
        this.setAttribute("aria-pressed", "true");
        each($$(".card", grid), function (_, card) {
          var show = cat === "all" || card.getAttribute("data-cat") === cat;
          card.style.display = show ? "" : "none";
        });
      });
    },

    modal: function () {
      var modal = $("[data-modal]");
      if (!modal) { return; }
      var lastFocus = null;

      function openModal(id) {
        var p = null;
        each(H.data.products, function (_, item) { if (item.id === id) { p = item; } });
        if (!p) { return; }
        setText("[data-modal-title]", p.name);
        setText("[data-modal-lede]", "Escrow holds your payment until the rider's on-site checklist passes. Nothing is released before that.");
        setHtml("[data-modal-rows]",
          '<div class="modal__row"><span class="modal__row-label">Price</span><span>' + p.price + "</span></div>" +
          '<div class="modal__row"><span class="modal__row-label">Seller</span><span>' + p.seller + "</span></div>" +
          '<div class="modal__row"><span class="modal__row-label">Serial</span><span>' + p.serial + "</span></div>" +
          '<div class="modal__row"><span class="modal__row-label">Shutter</span><span>' + p.shutter + "</span></div>" +
          '<div class="modal__row"><span class="modal__row-label">Warranty</span><span>' + p.warranty + "</span></div>" +
          '<div class="modal__row"><span class="modal__row-label">Rider fee</span><span>\u20b1180 \u00b7 quoted upfront</span></div>'
        );
        lastFocus = document.activeElement;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-locked");
        var x = $(".modal__close", modal);
        if (x) { x.focus(); }
      }

      function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-locked");
        if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
      }

      delegate("click", "[data-open-modal]", function () { openModal(this.getAttribute("data-open-modal")); });
      delegate("click", ".modal__close, .modal__backdrop, [data-modal-dismiss]", closeModal);
      on(document, "keydown", function (e) { if (e.key === "Escape" || e.keyCode === 27) { closeModal(); } });
    },

    navMenu: function () {
      function closeAll(except) {
        each($$(".nav__item--menu"), function (_, item) {
          if (item === except) { return; }
          item.classList.remove("is-open");
          var t = $("[data-nav-menu]", item);
          if (t) { t.setAttribute("aria-expanded", "false"); }
        });
      }
      delegate("click", "[data-nav-menu]", function (e) {
        e.preventDefault();
        var item = this.closest(".nav__item--menu"), open = this.getAttribute("aria-expanded") === "true";
        closeAll(item);
        item.classList.toggle("is-open", !open);
        this.setAttribute("aria-expanded", open ? "false" : "true");
      });
      on(document, "click", function (e) {
        if (e.target.closest && e.target.closest(".nav__item--menu")) { return; }
        closeAll(null);
      });
      on(document, "keydown", function (e) {
        if (e.key !== "Escape" && e.keyCode !== 27) { return; }
        var open = $(".nav__item--menu.is-open");
        if (!open) { return; }
        var t = $("[data-nav-menu]", open);
        closeAll(null);
        if (t) { t.focus(); }
      });
      on(document, "focusin", function (e) {
        if (e.target.closest && e.target.closest(".nav__item--menu")) { return; }
        closeAll(null);
      });
    },

    theme: function () {
      paintTheme(H.theme);
      delegate("click", "[data-theme-toggle]", function () {
        H.theme = H.theme === "light" ? "dark" : "light";
        H.store.set(THEME_KEY, H.theme);
        paintTheme(H.theme);
      });
    },

    accordion: function () {
      delegate("click", ".accordion__trigger", function () {
        var item = this.closest(".accordion__item");
        if (!item) { return; }
        var isOpen = item.classList.contains("accordion__item--open");
        each($$(".accordion__item", item.parentNode), function (_, sib) {
          if (sib === item) { return; }
          sib.classList.remove("accordion__item--open");
          var t = $(".accordion__trigger", sib), sg = $(".accordion__sign", sib);
          if (t) { t.setAttribute("aria-expanded", "false"); }
          if (sg) { sg.textContent = "+"; }
        });
        item.classList.toggle("accordion__item--open", !isOpen);
        this.setAttribute("aria-expanded", isOpen ? "false" : "true");
        var sign = $(".accordion__sign", this);
        if (sign) { sign.textContent = isOpen ? "+" : "\u2013"; }
      });
    }
  };

  function boot() {
    document.documentElement.classList.remove("no-js");
    H.modules.layout();
    H.modules.theme();
    H.modules.navMenu();
    H.modules.marquee();
    H.modules.drawer();
    H.modules.header();
    H.modules.toTop();
    H.modules.crumbs();
    H.modules.cookies();
    H.modules.settings();
    H.modules.stepper();
    H.modules.inventory();
    H.modules.modal();
    H.modules.accordion();
    H.modules.reveal();
    H.modules.shopCat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, false);
  } else {
    boot();
  }
})(window.HYBRID);
