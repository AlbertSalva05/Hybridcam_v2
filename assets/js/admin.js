/* =========================================================================
   hybrid.cam v2 — admin console (login gate + management views)
   Client-side only: this is a design build, so the "session" lives in
   sessionStorage and the records are seeded fixtures.
   ========================================================================= */

(function (H) {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function each(l, fn) { for (var i = 0; i < l.length; i++) { fn(i, l[i]); } }
  function on(n, t, fn) { if (n) { n.addEventListener(t, fn, false); } }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }


  var DATA = {
    orders: [
      ["HC-24817-MNL", "Canon EOS R50", "Alexa Reyes", "₱36,000", "In transit", "pink"],
      ["HC-24815-MNL", "Fujifilm X-S10", "Miguel Santos", "₱44,000", "Inspection", "gold"],
      ["HC-24809-QC", "Nikon Z fc + 28mm", "Denise Tan", "₱52,000", "Released", "mint"],
      ["HC-24802-MKT", "Sony ZV-1", "Paolo Cruz", "₱24,500", "Released", "mint"],
      ["HC-24798-MNL", "Sigma 30mm f/1.4", "Kaye Lim", "₱9,900", "Cancelled", "muted"],
      ["HC-24791-PSG", "Canon IXUS 190", "Jomar Diaz", "₱6,800", "Awaiting OTP", "gold"],
      ["HC-24786-MNL", "Fujifilm X-T30 II", "Rina Bautista", "₱39,500", "Released", "mint"],
      ["HC-24780-QC", "Canon EOS R10", "Nico Aguilar", "₱48,200", "Released", "mint"],
      ["HC-24775-MKT", "Sony A6400", "Trina Molina", "₱42,000", "Inspection", "gold"],
      ["HC-24769-PSG", "Sigma 16mm f/1.4", "Emil Ramos", "₱12,400", "Released", "mint"],
      ["HC-24761-MNL", "Nikon Z50", "Grace Uy", "₱37,800", "In transit", "pink"],
      ["HC-24754-QC", "Canon IXUS 285", "Bea Fernandez", "₱7,900", "Released", "mint"],
      ["HC-24748-MKT", "Fujifilm X100V", "Luis Panganiban", "₱78,000", "Awaiting OTP", "gold"],
      ["HC-24741-MNL", "Sony ZV-E10", "Hannah Cruz", "₱33,600", "Released", "mint"],
      ["HC-24735-PSG", "Canon 50mm f/1.8", "Rafael Lim", "₱5,400", "Cancelled", "muted"],
      ["HC-24729-QC", "Nikon D5600", "Joyce Santos", "₱28,900", "Released", "mint"],
      ["HC-24722-MNL", "Fujifilm X-E4", "Marco Reyes", "₱54,300", "Inspection", "gold"],
      ["HC-24716-MKT", "Sony RX100 VII", "Ella Navarro", "₱61,000", "Released", "mint"],
      ["HC-24709-PSG", "Canon EOS M50 II", "Ivan Delgado", "₱26,700", "In transit", "pink"],
      ["HC-24703-MNL", "Tamron 17-70mm", "Cleo Mercado", "₱31,200", "Released", "mint"],
      ["HC-24698-QC", "Olympus PEN E-P7", "Dana Villegas", "₱35,400", "Released", "mint"],
      ["HC-24691-MKT", "Panasonic GX85", "Karl Espino", "₱22,800", "Cancelled", "muted"]
    ],
    inventory: [
      ["Canon EOS R50", "ProGear PH", "SC 1,204", "Locked", "pink"],
      ["Fujifilm X-S10", "FujiVault", "SC 4,820", "Live", "mint"],
      ["Sony ZV-1", "Cubao Optics", "n/a", "Live", "mint"],
      ["Nikon Z fc + 28mm", "Manila Camera Lab", "SC 900", "Sold", "muted"],
      ["Canon IXUS 190", "Y2K Optics MNL", "n/a", "Live", "mint"],
      ["Sigma 30mm f/1.4 DC", "Glass Bank PH", "n/a", "Live", "mint"]
    ],
    riders: [
      ["HC-R-2291", "San Miguel → Ermita", "On task", "4.9", "pink"],
      ["HC-R-2274", "Cubao → Pasig", "On task", "4.8", "pink"],
      ["HC-R-2260", "Makati standby", "Available", "5.0", "mint"],
      ["HC-R-2248", "Quezon City standby", "Available", "4.7", "mint"],
      ["HC-R-2233", "Off shift", "Offline", "4.9", "muted"]
    ],
    sellers: [
      ["ProGear PH", "Verified", "38 cleared", "0 disputes", "mint"],
      ["FujiVault", "Verified", "24 cleared", "1 dispute", "gold"],
      ["Cubao Optics", "Verified", "51 cleared", "0 disputes", "mint"],
      ["Y2K Optics MNL", "Pending ID", "3 cleared", "0 disputes", "gold"],
      ["Glass Bank PH", "Verified", "17 cleared", "0 disputes", "mint"]
    ],
    payouts: [
      ["PO-8841", "ProGear PH", "₱36,000", "Queued · releases on OTP", "gold"],
      ["PO-8836", "Manila Camera Lab", "₱52,000", "Paid 06 Sep", "mint"],
      ["PO-8830", "Cubao Optics", "₱24,500", "Paid 05 Sep", "mint"],
      ["PO-8822", "Glass Bank PH", "₱9,900", "Reversed · failed inspection", "pink"]
    ]
  };

  var PER_PAGE = 10;
  var tableSeq = 0;

  function bodyRows(cols, rows, pillCol) {
    var tb = "";
    each(rows, function (_, r) {
      var tds = "";
      each(r, function (n, cell) {
        if (n >= cols.length) { return; }
        if (n === pillCol) {
          tds += '<td class="table__td"><span class="pill pill--' + r[r.length - 1] + '">' + esc(cell) + "</span></td>";
        } else {
          tds += '<td class="table__td">' + esc(cell) + "</td>";
        }
      });
      tb += '<tr class="table__row">' + tds + "</tr>";
    });
    return tb;
  }

  /* markup only; paginate() wires the controls once the view is in the DOM */
  function table(cols, rows, pillCol) {
    var id = "tbl-" + (++tableSeq);
    var th = "";
    each(cols, function (_, c) { th += '<th class="table__th" scope="col">' + esc(c) + "</th>"; });
    var pages = Math.ceil(rows.length / PER_PAGE);
    var pager = "";
    if (pages > 1) {
      var btns = "";
      for (var p = 1; p <= pages; p++) {
        btns += '<button class="pager__btn' + (p === 1 ? " pager__btn--active" : "") + '" type="button" data-page="' + p + '" aria-current="' + (p === 1 ? "page" : "false") + '">' + p + "</button>";
      }
      pager = '<nav class="pager" data-pager="' + id + '" aria-label="Table pages">' +
                '<span class="pager__info" data-pager-info aria-live="polite"></span>' +
                '<button class="pager__btn" type="button" data-page="prev" aria-label="Previous page">‹</button>' +
                btns +
                '<button class="pager__btn" type="button" data-page="next" aria-label="Next page">›</button>' +
              "</nav>";
    }
    PENDING[id] = { cols: cols, rows: rows, pillCol: pillCol };
    return '<div class="table-wrap"><table class="table" data-table="' + id + '"><thead><tr>' + th + "</tr></thead>" +
           '<tbody data-tbody="' + id + '">' + bodyRows(cols, rows.slice(0, PER_PAGE), pillCol) + "</tbody></table></div>" + pager;
  }

  var PENDING = {};

  function paginate(root) {
    each($$("[data-pager]", root), function (_, nav) {
      var id = nav.getAttribute("data-pager"), set = PENDING[id];
      if (!set) { return; }
      var tbody = $('[data-tbody="' + id + '"]', root);
      var pages = Math.ceil(set.rows.length / PER_PAGE), page = 1;

      function paint() {
        var from = (page - 1) * PER_PAGE;
        tbody.innerHTML = bodyRows(set.cols, set.rows.slice(from, from + PER_PAGE), set.pillCol);
        each($$("[data-page]", nav), function (__, b) {
          var v = b.getAttribute("data-page");
          if (v === "prev") { b.disabled = page === 1; return; }
          if (v === "next") { b.disabled = page === pages; return; }
          var on = parseInt(v, 10) === page;
          b.classList.toggle("pager__btn--active", on);
          b.setAttribute("aria-current", on ? "page" : "false");
        });
        var info = $("[data-pager-info]", nav);
        if (info) {
          info.textContent = "Showing " + (from + 1) + "–" + Math.min(set.rows.length, from + PER_PAGE) +
                             " of " + set.rows.length + " entries · page " + page + " of " + pages;
        }
      }
      each($$("[data-page]", nav), function (__, b) {
        on(b, "click", function () {
          var v = b.getAttribute("data-page");
          if (v === "prev") { page = Math.max(1, page - 1); }
          else if (v === "next") { page = Math.min(pages, page + 1); }
          else { page = parseInt(v, 10); }
          paint();
        });
      });
      paint();
    });
  }

  function bars(rows) {
    var html = "";
    each(rows, function (_, r) {
      html += '' +
        '<div class="bars__row">' +
          "<span>" + esc(r[0]) + "</span>" +
          '<span class="bars__track"><span class="bars__fill bars__fill--' + r[2] + '" style="width:' + r[1] + '%"></span></span>' +
          '<span class="bars__value">' + r[1] + "%</span>" +
        "</div>";
    });
    return '<div class="bars">' + html + "</div>";
  }

  var VIEWS = {
    overview: function () {
      return '' +
        '<div class="admin__head"><h2 class="admin__title">Operations overview</h2>' +
          '<div class="admin__actions"><button class="btn btn--ghost btn--sm" type="button">Export CSV</button>' +
          '<button class="btn btn--primary btn--sm" type="button">New manual order</button></div></div>' +
        '<div class="kpi">' +
          '<div class="kpi__cell"><p class="kpi__label">Escrow held today</p><p class="kpi__value">₱173,200</p></div>' +
          '<div class="kpi__cell"><p class="kpi__label">Active orders</p><p class="kpi__value kpi__value--pink">6</p></div>' +
          '<div class="kpi__cell"><p class="kpi__label">Riders on task</p><p class="kpi__value kpi__value--mint">2</p></div>' +
          '<div class="kpi__cell"><p class="kpi__label">Failed inspections</p><p class="kpi__value kpi__value--gold">3.1%</p></div>' +
        "</div>" +
        '<div class="panel panel--pad u-mt-4"><h3 class="panel__title">Funnel · last 30 days</h3><div class="u-mt-4">' +
          bars([["Reserved", 100, "mint"], ["Escrow funded", 88, "mint"], ["Inspection passed", 82, "gold"], ["Delivered", 79, "pink"], ["Released", 78, "pink"]]) +
        "</div></div>" +
        '<div class="panel panel--pad u-mt-4"><h3 class="panel__title">Attention needed</h3>' +
          '<p class="field__hint u-mt-4">Two items require a human decision before the end of shift.</p>' +
          '<div class="receipt u-mt-4">' +
            '<div class="receipt__row"><span class="receipt__label">HC-24791-PSG</span><span class="receipt__value">OTP unread for 40 min</span></div>' +
            '<div class="receipt__row"><span class="receipt__label">Y2K Optics MNL</span><span class="receipt__value">Seller ID pending review</span></div>' +
          "</div></div>";
    },
    orders: function () {
      return '' +
        '<div class="admin__head"><h2 class="admin__title">Orders</h2>' +
          '<div class="admin__actions"><button class="btn btn--ghost btn--sm" type="button">Filter</button>' +
          '<a class="btn btn--primary btn--sm" href="track.html">Open live map</a></div></div>' +
        table(["Reference", "Unit", "Buyer", "Escrow", "State"], DATA.orders, 4);
    },
    inventory: function () {
      return '' +
        '<div class="admin__head"><h2 class="admin__title">Inventory</h2>' +
          '<div class="admin__actions"><button class="btn btn--primary btn--sm" type="button">Add listing</button></div></div>' +
        table(["Unit", "Seller", "Shutter", "Listing"], DATA.inventory, 3);
    },
    riders: function () {
      return '' +
        '<div class="admin__head"><h2 class="admin__title">Riders</h2>' +
          '<div class="admin__actions"><button class="btn btn--ghost btn--sm" type="button">Dispatch board</button></div></div>' +
        table(["Rider", "Assignment", "State", "Rating"], DATA.riders, 2);
    },
    sellers: function () {
      return '' +
        '<div class="admin__head"><h2 class="admin__title">Sellers</h2>' +
          '<div class="admin__actions"><button class="btn btn--primary btn--sm" type="button">Review queue</button></div></div>' +
        table(["Seller", "KYC", "Volume", "Disputes"], DATA.sellers, 1);
    },
    payouts: function () {
      return '' +
        '<div class="admin__head"><h2 class="admin__title">Payouts</h2>' +
          '<div class="admin__actions"><button class="btn btn--ghost btn--sm" type="button">Bank file</button></div></div>' +
        table(["Batch", "Seller", "Amount", "State"], DATA.payouts, 3);
    },
    settings: function () {
      return '' +
        '<div class="admin__head"><h2 class="admin__title">Business settings</h2></div>' +
        '<div class="panel panel--pad"><h3 class="panel__title">Escrow &amp; fees</h3>' +
          '<div class="form-grid u-mt-4">' +
            '<p class="field"><label class="field__label" for="s-fee">Rider fee (Metro Manila)</label><input class="field__control" id="s-fee" type="text" value="₱180" /></p>' +
            '<p class="field"><label class="field__label" for="s-hold">Escrow hold window</label><input class="field__control" id="s-hold" type="text" value="48 hours" /></p>' +
            '<p class="field"><label class="field__label" for="s-thresh">Inspection threshold</label><input class="field__control" id="s-thresh" type="text" value="₱10,000" /></p>' +
            '<p class="field"><label class="field__label" for="s-share">Location sharing expiry</label><input class="field__control" id="s-share" type="text" value="15 minutes" /></p>' +
          "</div>" +
          '<p class="u-mt-4"><button class="btn btn--primary btn--sm" type="button">Save changes</button></p></div>' +
        '<div class="panel panel--pad u-mt-4"><h3 class="panel__title">Promotions</h3>' +
          '<p class="field__hint u-mt-4">The rewards ribbon and the discount popup on the landing page read from these two records.</p>' +
          '<div class="receipt u-mt-4">' +
            '<div class="receipt__row"><span class="receipt__label">HYBRID-RIDER-FREE</span><span class="receipt__value">Active · 48 hours</span></div>' +
            '<div class="receipt__row"><span class="receipt__label">THIRD-RIDE-FREE</span><span class="receipt__value">Active · monthly rewards</span></div>' +
          "</div></div>";
    }
  };

  var NAV = [
    ["overview", "Overview"], ["orders", "Orders"], ["inventory", "Inventory"],
    ["riders", "Riders"], ["sellers", "Sellers"], ["payouts", "Payouts"], ["settings", "Settings"]
  ];

  function mountConsole() {
    var shell = $("[data-admin]");
    if (!shell) { return; }
    var side = "";
    each(NAV, function (n, item) {
      side += '<button class="admin__nav-btn' + (n === 0 ? " admin__nav-btn--active" : "") + '" type="button" data-view="' + item[0] + '" aria-current="' + (n === 0 ? "page" : "false") + '">' + item[1] + "</button>";
    });
    var opts = "";
    each(NAV, function (_, item) { opts += '<option value="' + item[0] + '">' + item[1] + "</option>"; });

    shell.innerHTML = '' +
      '<div class="admin__nav">' +
        '<p class="admin__picker field">' +
          '<label class="field__label" for="admin-section">Console section</label>' +
          '<select class="field__select" id="admin-section" data-admin-picker>' + opts + "</select>" +
        "</p>" +
        '<nav class="admin__side" aria-label="Console sections">' + side + "</nav>" +
      "</div>" +
      '<div class="admin__main" data-admin-main></div>';

    function paint(key) {
      var main = $("[data-admin-main]", shell);
      PENDING = {};
      main.innerHTML = (VIEWS[key] || VIEWS.overview)();
      paginate(main);
      each($$("[data-view]", shell), function (_, b) {
        var active = b.getAttribute("data-view") === key;
        b.classList.toggle("admin__nav-btn--active", active);
        b.setAttribute("aria-current", active ? "page" : "false");
      });
      var picker = $("[data-admin-picker]", shell);
      if (picker && picker.value !== key) { picker.value = key; }
    }
    each($$("[data-view]", shell), function (_, b) {
      on(b, "click", function () { paint(b.getAttribute("data-view")); });
    });
    on($("[data-admin-picker]", shell), "change", function () { paint(this.value); });
    paint("overview");
  }

  function boot() {
    if (!$("[data-admin]")) { return; }
    /* the shared gate (assets/js/gate.js) has already run: if it redirected,
       this page is unloading and mounting is harmless. */
    mountConsole();
  }

  H.admin = { data: DATA, views: VIEWS };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, false);
  } else {
    boot();
  }
})(window.HYBRID = window.HYBRID || {});
