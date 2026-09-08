/* =========================================================================
   hybrid.cam v2 — behaviour layer (loads after assets/js/main.js)
   Modules: nav config · hero slider (a distinct animated graphic per slide)
            about timeline · product grid + search/filters + detail modal
            feature sims · how-to simulator · services · testimonial coverflow
            promo popup · delivery/meet-up tabs + wizard (ID + face + OTP)
            meet-up picker · MapLibre maps with labelled pins, legend, tooltips
   Vanilla ES5. No dependencies beyond optional MapLibre.
   ========================================================================= */

(function (H) {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function each(l, fn) { for (var i = 0; i < l.length; i++) { fn(i, l[i]); } }
  function on(n, t, fn) { if (n) { n.addEventListener(t, fn, false); } }
  function delegate(t, s, fn) {
    document.addEventListener(t, function (e) {
      var el = e.target && e.target.closest ? e.target.closest(s) : null;
      if (el) { fn.call(el, e); }
    }, false);
  }
  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function store(key, val) {
    try {
      if (typeof val === "undefined") { return window.localStorage.getItem(key); }
      window.localStorage.setItem(key, val);
    } catch (e) { return null; }
    return val;
  }

  /* ------------------------------------------------------ nav (v2 sitemap) */
  H.nav = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "shop", label: "Inventory", href: "shop.html" },
    { id: "protocol", label: "Escrow Protocol", href: "protocol.html" },
    { id: "track", label: "Track Order", href: "track.html" },
    { id: "sellers", label: "For Sellers", href: "sellers.html" },
    { id: "admin", label: "Admin", href: "admin.html" },
    { id: "source", label: "Source Files", href: "source.html" }
  ];

  H.menu = [
    { id: "shop", label: "Inventory", href: "shop.html" },
    {
      id: "trust", label: "Trust", children: [
        { id: "protocol", label: "Escrow Protocol", note: "The seven checkpoints", href: "protocol.html" },
        { id: "track", label: "Track Order", note: "Live map + status", href: "track.html" }
      ]
    },
    {
      id: "more", label: "Company", children: [
        { id: "sellers", label: "For Sellers", note: "List a camera", href: "sellers.html" },
        { id: "admin", label: "Admin Console", note: "Operations login", href: "admin.html" },
        { id: "source", label: "Source Files", note: "Browse & copy code", href: "source.html" }
      ]
    }
  ];

  /* ============================================================== content */
  H.v2 = {
    /* each slide names its own graphic: camera · vault · inspect · radar */
    slides: [
      {
        graphic: "camera", lead: true,
        title: "A camera marketplace<br /><span class=\"serif-accent\">where money moves last.</span>",
        lede: "Escrowed peer-to-peer trading across Metro Manila — rider inspection on every unit, payout only after the checklist passes.",
        actions: [["Browse the collection", "#products", "btn--primary"], ["How escrow works", "protocol.html", "btn--ghost"]]
      },
      {
        graphic: "vault",
        title: "Your payment sits still<br /><span class=\"serif-accent\">until the unit passes.</span>",
        lede: "Escrow funds at booking and releases at the delivery OTP. The seller can see the money exists — they cannot touch it early.",
        actions: [["Start an escrowed order", "#delivery", "btn--primary"], ["Read the guarantee", "protocol.html", "btn--ghost"]]
      },
      {
        graphic: "inspect",
        title: "Twelve checks<br /><span class=\"serif-accent\">before it leaves the door.</span>",
        lede: "Shutter, sensor, glass, dials, slots, battery seat — signed on-device and filmed. The clip stays attached to your order.",
        actions: [["See the checklist", "protocol.html#checklist", "btn--primary"], ["Watch a walkthrough", "#howto", "btn--ghost"]]
      },
      {
        graphic: "radar",
        title: "One pin, three people,<br /><span class=\"serif-accent\">one safe handoff.</span>",
        lede: "Pick a geofenced meet point or a doorstep delivery. Location sharing expires fifteen minutes after handoff.",
        actions: [["Book a meet-up", "#delivery", "btn--primary"], ["Track an order", "track.html", "btn--ghost"]]
      }
    ],

    story: [
      { year: "2023", t: "One bad meet-up", b: "A buyer with cash, a seller with an untested body, and nobody willing to move first.", g: "spark" },
      { year: "2024", t: "Escrow first", b: "Funds hold at booking. Release needs the buyer's OTP at the door.", g: "vault" },
      { year: "2024", t: "Rider inspection", b: "Twelve checks on a live three-way call, recorded and filed.", g: "lens" },
      { year: "2025", t: "Safe meet points", b: "Geofenced locations, masked addresses, pins that expire.", g: "pin" },
      { year: "2026", t: "1,284 units cleared", b: "3.1% fail inspection — and every one of them went home refunded.", g: "check" }
    ],

    products: [
      {
        id: "r50", best: true, name: "Canon EOS R50", price: "₱36,000", value: 36000, spec: "24.2 MP · 4K30 · SC 1,204",
        seller: "ProGear PH", brand: "Canon", condition: "MINT · VERIFIED", grade: "mint", cat: "mirrorless",
        colors: [["Black", "#15181f"], ["Ivory white", "#e8e3d8"], ["Graphite", "#3d4350"]],
        photos: ["body + kit lens, 3/4 view", "top plate & dials", "sensor & mount", "screen articulated"],
        description: "A light APS-C mirrorless body that behaves like a much more expensive camera. Inspected at 1,204 actuations with the original RF-S 18-45mm kit lens, both free of fungus and separation.",
        usage: ["Best for content creators moving up from a phone.", "Dual-purpose: 4K30 video and 15 fps stills.", "Pairs with RF-S glass; adapts to EF with the official mount."],
        options: ["Body only — ₱36,000", "With RF-S 18-45mm kit — ₱41,500", "With extra LP-E17 battery — +₱2,200", "Rider inspection included on all options"],
        videos: [["Unboxing & first-day setup", "6:14 · beginner"], ["Cleaning the sensor safely", "4:02 · maintenance"], ["Best practices for handoff day", "3:31 · escrow"]],
        serial: "062XXXXX0913", shutter: "1,204 actuations", warranty: "Local warranty until Mar 2027"
      },
      {
        id: "xs10", best: true, name: "Fujifilm X-S10", price: "₱44,000", value: 44000, spec: "26.1 MP · IBIS · SC 4,820",
        seller: "FujiVault", brand: "Fujifilm", condition: "LIKE NEW", grade: "like-new", cat: "mirrorless",
        colors: [["Black", "#15181f"], ["Silver", "#c9ccd3"]],
        photos: ["body, 3/4 view", "grip detail", "film simulation dial", "hot shoe & ports"],
        description: "In-body stabilisation in a small grip-forward body, with Fujifilm's film simulations straight out of camera. Shutter count verified at 4,820 with no sensor marks.",
        usage: ["Best for travel and street work where a tripod is not welcome.", "Film simulations reduce editing time to near zero.", "Handles well with small primes; front-heavy with long zooms."],
        options: ["Body only — ₱44,000", "With XC 15-45mm — ₱48,900", "With XF 35mm f/2 — ₱58,500", "Seller-backed 30-day window"],
        videos: [["Film simulation recipes", "8:47 · look"], ["IBIS handheld technique", "5:12 · technique"], ["Checking IBIS at inspection", "2:58 · escrow"]],
        serial: "1AQ2XXXX4471", shutter: "4,820 actuations", warranty: "Seller-backed 30 days"
      },
      {
        id: "zv1", name: "Sony ZV-1", price: "₱24,500", value: 24500, spec: "20.1 MP · 1\" sensor · vlog",
        seller: "Cubao Optics", brand: "Sony", condition: "GOOD · VERIFIED", grade: "good", cat: "digicam",
        colors: [["Black", "#15181f"], ["White", "#eceae4"]],
        photos: ["compact digicam, front", "flip screen out", "windscreen mounted", "port door open"],
        description: "A pocket vlogging camera with a bright zoom and a screen that faces you. Light cosmetic wear on the base plate, glass and sensor clean.",
        usage: ["Best for talking-head video and travel clips.", "Product showcase mode is the reason most people buy it.", "Use the bundled windscreen outdoors — the mic is exposed."],
        options: ["Body only — ₱24,500", "With grip tripod — ₱27,900", "With 64GB V30 card — +₱1,400", "Inspection pass only"],
        videos: [["Vlog setup in five minutes", "5:02 · beginner"], ["Audio without an external mic", "6:39 · audio"], ["Battery care & storage", "3:18 · maintenance"]],
        serial: "39XXXX882", shutter: "Not applicable", warranty: "Seller-backed 14 days"
      },
      {
        id: "zfc", best: true, name: "Nikon Z fc + 28mm", price: "₱52,000", value: 52000, spec: "20.9 MP · retro body · SC 900",
        seller: "Manila Camera Lab", brand: "Nikon", condition: "MINT · VERIFIED", grade: "mint", cat: "mirrorless",
        colors: [["Silver / black", "#c9ccd3"], ["Amber brown", "#8a6a48"], ["Mint green", "#8fd3bd"]],
        photos: ["retro body with 28mm", "dial cluster top", "leatherette detail", "vari-angle screen"],
        description: "Dial-driven retro body with the pancake 28mm SE lens. Only 900 actuations; the leatherette and dials show no lift or shine.",
        usage: ["Best for photographers who prefer manual dials over menus.", "The 28mm pancake keeps it genuinely pocketable.", "Vari-angle screen makes it a capable second video body."],
        options: ["With 28mm SE — ₱52,000", "Body only — ₱44,900", "Add 16-50mm VR — +₱9,500", "Local warranty until Aug 2027"],
        videos: [["Shooting with dials only", "7:22 · technique"], ["Cleaning leatherette safely", "3:44 · maintenance"], ["What to check on retro bodies", "4:56 · escrow"]],
        serial: "60XXXXX113", shutter: "900 actuations", warranty: "Local warranty until Aug 2027"
      },
      {
        id: "ixus", name: "Canon IXUS 190", price: "₱6,800", value: 6800, spec: "20 MP · 10x zoom · CCD look",
        seller: "Y2K Optics MNL", brand: "Canon", condition: "GOOD", grade: "good", cat: "digicam",
        colors: [["Black", "#15181f"], ["Silver", "#c9ccd3"], ["Rose", "#d9a1ad"]],
        photos: ["pocket digicam, front", "rear screen on", "battery door", "in-hand scale"],
        description: "The digicam look people are paying for again — soft highlights, honest grain, straight-out-of-camera colour. Fully working with a fresh battery and strap.",
        usage: ["Best for the Y2K point-and-shoot aesthetic.", "Shoot in daylight; the small sensor struggles after dark.", "Carry spare NB-11LH batteries on trips."],
        options: ["Camera + battery — ₱6,800", "With 32GB card — ₱7,400", "With soft case — +₱450", "Inspection pass only"],
        videos: [["Getting the digicam look", "4:11 · look"], ["Flash technique indoors", "3:26 · technique"], ["Storing CCD cameras", "2:47 · maintenance"]],
        serial: "01XXXX447", shutter: "Not applicable", warranty: "Inspection pass only"
      },
      {
        id: "sigma30", name: "Sigma 30mm f/1.4 DC", price: "₱9,900", value: 9900, spec: "APS-C prime · no fungus",
        seller: "Glass Bank PH", brand: "Sigma", condition: "MINT", grade: "mint", cat: "glass",
        colors: [["Canon EF-S", "#2b3040"], ["Nikon F", "#3a3f2f"], ["Sony E", "#2f3a48"]],
        photos: ["prime lens, side", "front element", "rear mount & contacts", "hood attached"],
        description: "A fast normal prime for APS-C bodies. Inspected under a torch: no fungus, no haze, no separation, and the aperture blades are dry and snappy.",
        usage: ["Best for portraits and low light on a crop body.", "Wide open at f/1.4 for separation; f/2.8 for critical sharpness.", "Keep the hood on — the front element is broad and exposed."],
        options: ["Canon EF-S mount — ₱9,900", "Nikon F mount — ₱9,900", "Sony E mount — ₱11,400", "Add UV filter — +₱600"],
        videos: [["Checking glass for fungus", "5:33 · escrow"], ["Focus calibration basics", "6:08 · technique"], ["Storing glass in humidity", "3:52 · maintenance"]],
        serial: "52XXXXX20", shutter: "Not applicable", warranty: "Inspection pass only"
      }
    ],

    /* nine services, 3x3 — icon key drives the CSS glyph */
    services: [
      { i: "shield", t: "Escrowed checkout", b: "We hold the payment from booking to handoff.", m: "Every order" },
      { i: "lens", t: "Rider inspection call", b: "Twelve checks on a live three-way call, recorded.", m: "Above ₱10,000" },
      { i: "pin", t: "Scheduled meet-up", b: "Geofenced safe points with expiring pins.", m: "Metro Manila" },
      { i: "tag", t: "Serial & shutter audit", b: "Logged into the order as a permanent record.", m: "Permanent" },
      { i: "user", t: "Seller onboarding", b: "ID check, payout setup and listing guidance.", m: "First 3 free" },
      { i: "scale", t: "Dispute resolution", b: "A person reviews the clip inside 48 hours.", m: "48-hour window" }
    ],

    howto: [
      { label: "Reserve the unit", hint: "Lock a camera against your order.", anim: "lens", screen: { title: "Reserve · Canon EOS R50", body: "The listing goes dark to other buyers the moment you reserve. Nothing is charged yet.", rows: [["Unit", "EOS R50 + 18-45mm"], ["Reserved for", "45 minutes"], ["Charged now", "₱0.00"]], meter: 20, cta: "Reserve unit" } },
      { label: "Fund escrow", hint: "Money moves into escrow, not to the seller.", anim: "coins", screen: { title: "Fund escrow", body: "Pay by card, GCash or bank transfer. The seller sees the funds exist and cannot touch them.", rows: [["Escrow amount", "₱36,000"], ["Rider fee", "₱180 quoted"], ["Status", "Held"]], meter: 45, cta: "Fund ₱36,180" } },
      { label: "Watch the inspection", hint: "Join the live three-way call.", anim: "checks", screen: { title: "Inspection · live", body: "The rider works down the checklist on camera. You can ask for any check to be repeated.", rows: [["Checklist", "9 of 12 signed"], ["Recording", "Attached to order"], ["If it fails", "Auto-cancel + refund"]], meter: 68, cta: "Join the call" } },
      { label: "Meet or receive", hint: "Doorstep delivery or a safe meet point.", anim: "route", screen: { title: "Handoff", body: "Track the rider live. Location sharing expires fifteen minutes after handoff.", rows: [["Meet point", "Arellano, San Miguel"], ["ETA", "8 minutes"], ["Seal code", "TS-4491-A"]], meter: 85, cta: "Open live map" } },
      { label: "Release with OTP", hint: "Confirm the seal, release the payment.", anim: "seal", screen: { title: "Release escrow", body: "Check the tamper seal against the code, then read the OTP to the rider.", rows: [["Seal", "Intact"], ["Payout", "Released to seller"], ["Dispute window", "48 hours"]], meter: 100, cta: "Release ₱36,000" } }
    ],

    testimonials: [
      { q: "Watching the rider fire the shutter on a call was the first time buying used felt normal.", n: "Alexa R.", m: "Buyer · Quezon City", i: "AR" },
      { q: "I stopped losing afternoons to meet-ups that go nowhere. The order is funded before I pack the body.", n: "Miguel S.", m: "Seller · Makati", i: "MS" },
      { q: "The inspection clip stayed on my order. I forwarded it a year later and the camera sold in two days.", n: "Denise T.", m: "Buyer & seller · Pasig", i: "DT" },
      { q: "My mother sold my late father's Nikon through them. Someone actually explained every step to her.", n: "Paolo C.", m: "Seller · Parañaque", i: "PC" },
      { q: "The unit failed on the call. Refund landed the next morning, and nobody argued about the rider fee.", n: "Kaye L.", m: "Buyer · Mandaluyong", i: "KL" }
    ],

    spots: [
      { id: "arellano", name: "Arellano School, San Miguel", meta: "Barangay-monitored · CCTV · 24/7", lng: 120.9905, lat: 14.5985, slots: ["09:00", "11:30", "14:00", "16:30"] },
      { id: "trinoma", name: "Trinoma Mall, North Ave", meta: "Guarded concourse · mall hours", lng: 121.0335, lat: 14.6537, slots: ["10:00", "13:00", "15:30", "18:00"] },
      { id: "greenbelt", name: "Greenbelt 3, Makati", meta: "Concierge desk · CCTV", lng: 121.0223, lat: 14.5527, slots: ["10:30", "12:00", "15:00", "17:30"] },
      { id: "sm-manila", name: "SM Manila, Ermita", meta: "Ground-floor lobby · CCTV", lng: 120.9836, lat: 14.5905, slots: ["09:30", "12:30", "14:30", "17:00"] }
    ],

    route: [
      [120.9905, 14.5985], [120.9888, 14.5968], [120.9866, 14.5955], [120.9852, 14.5941],
      [120.9846, 14.5928], [120.9841, 14.5916], [120.9838, 14.5910], [120.9836, 14.5905]
    ],

    trackStates: [
      { t: "Order funded", m: "Escrow ₱36,000 held", s: "done" },
      { t: "Rider assigned", m: "Rider ID HC-R-2291", s: "done" },
      { t: "Inspection passed", m: "12 of 12 checks signed", s: "done" },
      { t: "In transit", m: "Live location shared", s: "live" },
      { t: "Handoff & OTP", m: "Awaiting buyer OTP", s: "next" },
      { t: "Escrow released", m: "Payout to seller", s: "next" }
    ]
  };

  /* ============================================== hero slide graphics (CSS) */
  var GRAPHIC = {
    camera: function () {
      return '' +
        '<div class="gfx gfx--camera" aria-hidden="true">' +
          '<span class="gfx__orbit"><span class="gfx__satellite"></span></span>' +
          '<span class="gfx__orbit gfx__orbit--inner"><span class="gfx__satellite gfx__satellite--gold"></span></span>' +
          '<div class="cam">' +
            '<span class="cam__hump"></span><span class="cam__shutter"></span><span class="cam__grip"></span>' +
            '<div class="cam__lens"><span class="cam__iris"></span><span class="cam__glint"></span></div>' +
            '<span class="cam__scan"></span>' +
          "</div>" +
          '<span class="gfx__tag gfx__tag--tl"><span class="gfx__dot gfx__dot--mint"></span>Live 3-way call</span>' +
          '<span class="gfx__tag gfx__tag--br"><span class="gfx__dot gfx__dot--gold"></span>Shutter 4,820 verified</span>' +
        "</div>";
    },
    vault: function () {
      var coins = "";
      for (var i = 0; i < 4; i++) { coins += '<span class="vaultg__coin vaultg__coin--' + (i + 1) + '"></span>'; }
      return '' +
        '<div class="gfx gfx--vault" aria-hidden="true">' +
          '<div class="vaultg">' +
            '<span class="vaultg__slot"></span>' + coins +
            '<div class="vaultg__body">' +
              '<span class="vaultg__shield"><span class="vaultg__lock"></span></span>' +
              '<span class="vaultg__amount">₱36,000</span>' +
              '<span class="vaultg__bar"><span class="vaultg__bar-fill"></span></span>' +
              '<span class="vaultg__caption">HELD IN ESCROW</span>' +
            "</div>" +
          "</div>" +
          '<span class="gfx__tag gfx__tag--tl"><span class="gfx__dot gfx__dot--gold"></span>Funds captured</span>' +
          '<span class="gfx__tag gfx__tag--br"><span class="gfx__dot gfx__dot--mint"></span>Releases on OTP</span>' +
        "</div>";
    },
    inspect: function () {
      var rows = "", labels = ["POWER ON", "SHUTTER FIRE", "SENSOR CLEAN", "GLASS CLEAR", "DIALS OK"];
      each(labels, function (n, l) {
        rows += '<span class="inspg__row" style="animation-delay:' + (n * 0.7) + 's"><span class="inspg__box"></span>' + l + "</span>";
      });
      return '' +
        '<div class="gfx gfx--inspect" aria-hidden="true">' +
          '<div class="inspg">' +
            '<span class="inspg__glass"><span class="inspg__glass-ring"></span></span>' +
            '<div class="inspg__sheet">' +
              '<span class="inspg__head">INSPECTION · HC-24817</span>' + rows +
              '<span class="inspg__beam"></span>' +
            "</div>" +
          "</div>" +
          '<span class="gfx__tag gfx__tag--tl"><span class="gfx__dot gfx__dot--mint"></span>9 of 12 signed</span>' +
          '<span class="gfx__tag gfx__tag--br"><span class="gfx__dot gfx__dot--pink"></span>Clip attached</span>' +
        "</div>";
    },
    radar: function () {
      return '' +
        '<div class="gfx gfx--radar" aria-hidden="true">' +
          '<div class="radarg">' +
            '<span class="radarg__ring radarg__ring--1"></span>' +
            '<span class="radarg__ring radarg__ring--2"></span>' +
            '<span class="radarg__ring radarg__ring--3"></span>' +
            '<span class="radarg__sweep"></span>' +
            '<span class="radarg__grid"></span>' +
            '<span class="radarg__pin radarg__pin--meet"><span class="radarg__dot radarg__dot--mint"></span><span class="radarg__label">MEET POINT</span></span>' +
            '<span class="radarg__pin radarg__pin--seller"><span class="radarg__dot radarg__dot--gold"></span><span class="radarg__label">SELLER</span></span>' +
            '<span class="radarg__pin radarg__pin--rider"><span class="radarg__dot radarg__dot--pink"></span><span class="radarg__label">RIDER 0.9 KM</span></span>' +
          "</div>" +
          '<span class="gfx__tag gfx__tag--tl"><span class="gfx__dot gfx__dot--pink"></span>ETA 8 min</span>' +
          '<span class="gfx__tag gfx__tag--br"><span class="gfx__dot gfx__dot--mint"></span>Pin expires in 15 min</span>' +
        "</div>";
    }
  };

  var V = {};

  /* -------------------------------------------------------------- 1 slider */
  V.slider = function () {
    var root = $("[data-slider]");
    if (!root) { return; }
    var slides = H.v2.slides, i = 0, timer = null;

    var html = "", dots = "";
    each(slides, function (n, s) {
      var actions = "";
      each(s.actions, function (__, a) {
        actions += '<a class="btn ' + a[2] + '" href="' + a[1] + '"' + (n === 0 ? "" : ' tabindex="-1"') + ">" + esc(a[0]) + "</a>";
      });
      html += '' +
        '<div class="slider__slide' + (n === 0 ? " slider__slide--active" : "") + '" role="group" aria-roledescription="slide" ' +
             'aria-label="Slide ' + (n + 1) + " of " + slides.length + '"' + (n === 0 ? "" : ' aria-hidden="true"') + '>' +
          '<div class="slider__copy">' +
            "<" + (s.lead ? "h1" : "h2") + ' class="slider__title">' + s.title + "</" + (s.lead ? "h1" : "h2") + ">" +
            '<p class="slider__lede">' + esc(s.lede) + "</p>" +
            '<div class="slider__actions">' + actions + "</div>" +
          "</div>" +
          '<div class="slider__stage">' + (GRAPHIC[s.graphic] || GRAPHIC.camera)() + "</div>" +
        "</div>";
      dots += '<button class="slider__dot' + (n === 0 ? " slider__dot--active" : "") + '" type="button" data-slide-to="' + n + '" ' +
              'aria-label="Show slide ' + (n + 1) + '"' + (n === 0 ? ' aria-current="true"' : "") + "></button>";
    });

    root.innerHTML = '' +
      '<div class="slider__viewport" aria-live="polite">' + html + "</div>" +
      '<div class="slider__controls">' +
        '<button class="slider__arrow slider__arrow--prev" type="button" data-slide-prev aria-label="Previous slide"><span class="slider__arrow-glyph" aria-hidden="true"></span></button>' +
        '<button class="slider__arrow slider__arrow--next" type="button" data-slide-next aria-label="Next slide"><span class="slider__arrow-glyph" aria-hidden="true"></span></button>' +
        '<div class="slider__dots">' + dots + "</div>" +
        '<button class="btn btn--quiet btn--sm" type="button" data-slide-play aria-pressed="true">Pause</button>' +
        '<span class="slider__count" data-slide-count></span>' +
      "</div>" +
      '<div class="slider__rail"><span class="slider__rail-fill" data-slide-rail></span></div>';

    var nodes = $$(".slider__slide", root);

    function paint() {
      each(nodes, function (n, node) {
        var active = n === i;
        node.classList.toggle("slider__slide--active", active);
        if (active) { node.removeAttribute("aria-hidden"); } else { node.setAttribute("aria-hidden", "true"); }
        each($$(".btn", node), function (__, b) {
          if (active) { b.removeAttribute("tabindex"); } else { b.setAttribute("tabindex", "-1"); }
        });
      });
      each($$("[data-slide-to]", root), function (n, d) {
        d.classList.toggle("slider__dot--active", n === i);
        if (n === i) { d.setAttribute("aria-current", "true"); } else { d.removeAttribute("aria-current"); }
      });
      var c = $("[data-slide-count]", root);
      if (c) { c.textContent = "0" + (i + 1) + " / 0" + slides.length; }
      var rail = $("[data-slide-rail]", root);
      if (rail) { rail.style.width = (((i + 1) / slides.length) * 100).toFixed(1) + "%"; }
    }
    function go(n) { i = (n + slides.length) % slides.length; paint(); }
    function play() { if (reduced()) { return; } stop(); timer = window.setInterval(function () { go(i + 1); }, 7000); }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    on($("[data-slide-next]", root), "click", function () { go(i + 1); play(); });
    on($("[data-slide-prev]", root), "click", function () { go(i - 1); play(); });
    each($$("[data-slide-to]", root), function (n, d) { on(d, "click", function () { go(n); play(); }); });
    var toggle = $("[data-slide-play]", root);
    on(toggle, "click", function () {
      var running = timer !== null;
      if (running) { stop(); } else { play(); }
      toggle.textContent = running ? "Play" : "Pause";
      toggle.setAttribute("aria-pressed", running ? "false" : "true");
    });
    on(root, "mouseenter", stop);
    on(root, "mouseleave", function () { if (toggle && toggle.getAttribute("aria-pressed") === "true") { play(); } });
    on(root, "focusin", stop);
    on(root, "keydown", function (e) {
      if (e.key === "ArrowRight") { go(i + 1); }
      if (e.key === "ArrowLeft") { go(i - 1); }
    });

    paint();
    if (reduced() && toggle) { toggle.textContent = "Play"; toggle.setAttribute("aria-pressed", "false"); }
    else { play(); }
  };

  /* ------------------------------------------------------- 2 about timeline */
  V.story = function () {
    var root = $("[data-story]");
    if (!root) { return; }
    var html = "";
    each(H.v2.story, function (_, s) {
      html += '' +
        '<li class="story__item reveal">' +
          '<span class="story__marker" aria-hidden="true"><span class="story__glyph story__glyph--' + s.g + '"></span></span>' +
          '<span class="story__year">' + esc(s.year) + "</span>" +
          '<h3 class="story__title">' + esc(s.t) + "</h3>" +
          '<p class="story__body">' + esc(s.b) + "</p>" +
        "</li>";
    });
    root.innerHTML = html;
  };

  /* ------------------------------------------ 3 products: grid + filtering */
  V.products = function () {
    var grid = $("[data-products]");
    if (!grid) { return V.productModal(); }
    var limit = parseInt(grid.getAttribute("data-limit"), 10) || 0;
    var bestOnly = grid.hasAttribute("data-best");

    function card(p) {
      var sw = "";
      each(p.colors, function (_, c) {
        sw += '<span class="pcard__swatch" style="background:' + c[1] + '" title="' + esc(c[0]) + '"></span>';
      });
      return '' +
        '<article class="card pcard reveal is-in" data-cat="' + p.cat + '">' +
          '<div class="card__media pcard__media">' +
            '<span class="slot pcard__slot">[ ' + esc(p.photos[0]) + " ]</span>" +
            '<span class="pcard__tags">' +
              (p.best ? '<span class="badge badge--gold">Best seller</span>' : "") +
              '<span class="badge badge--mint">' + esc(p.condition) + "</span></span>" +
          "</div>" +
          '<div class="card__body">' +
            '<h3 class="card__name">' + esc(p.name) + "</h3>" +
            '<p class="card__spec">' + esc(p.spec) + "</p>" +
            '<span class="pcard__swatches" aria-hidden="true">' + sw + "</span>" +
            '<div class="card__price-row"><span class="card__price">' + esc(p.price) + '</span><span class="card__seller">' + esc(p.seller) + "</span></div>" +
            '<button class="btn btn--primary btn--block" type="button" data-open-product="' + p.id + '">View details</button>' +
          "</div>" +
        "</article>";
    }

    function draw(list) {
      if (!list.length) {
        grid.innerHTML = '<p class="empty">No units match those filters yet. Widen the price range or clear a filter.</p>';
        return;
      }
      var html = "";
      each(list, function (_, p) { html += card(p); });
      grid.innerHTML = html;
    }

    var filters = $("[data-filters]");
    if (!filters) {
      var list = bestOnly ? H.v2.products.filter(function (p) { return p.best; }) : H.v2.products;
      draw(limit ? list.slice(0, limit) : list);
      return V.productModal();
    }

    var state = { q: "", cat: "all", brand: "all", price: "all", grade: "all", sort: "featured" };

    function apply() {
      var list = H.v2.products.filter(function (p) {
        if (state.cat !== "all" && p.cat !== state.cat) { return false; }
        if (state.brand !== "all" && p.brand !== state.brand) { return false; }
        if (state.grade !== "all" && p.grade !== state.grade) { return false; }
        if (state.price === "u10" && p.value >= 10000) { return false; }
        if (state.price === "10-30" && (p.value < 10000 || p.value > 30000)) { return false; }
        if (state.price === "30-50" && (p.value < 30000 || p.value > 50000)) { return false; }
        if (state.price === "o50" && p.value <= 50000) { return false; }
        if (state.q) {
          var hay = (p.name + " " + p.spec + " " + p.seller + " " + p.brand + " " + p.cat).toLowerCase();
          if (hay.indexOf(state.q.toLowerCase()) === -1) { return false; }
        }
        return true;
      });
      if (state.sort === "low") { list.sort(function (a, b) { return a.value - b.value; }); }
      if (state.sort === "high") { list.sort(function (a, b) { return b.value - a.value; }); }
      if (state.sort === "name") { list.sort(function (a, b) { return a.name.localeCompare(b.name); }); }
      draw(list);
      var count = $("[data-filter-count]");
      if (count) {
        count.textContent = list.length + (list.length === 1 ? " unit" : " units") + " shown of " + H.v2.products.length;
      }
    }

    var search = $("[data-filter-q]", filters);
    on(search, "input", function () { state.q = this.value.trim(); apply(); });
    each($$("[data-filter-chip]", filters), function (_, chip) {
      on(chip, "click", function () {
        each($$("[data-filter-chip]", filters), function (__, c) {
          c.classList.remove("filter-bar__chip--active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("filter-bar__chip--active");
        chip.setAttribute("aria-pressed", "true");
        state.cat = chip.getAttribute("data-filter-chip");
        apply();
      });
    });
    each(["brand", "price", "grade", "sort"], function (_, key) {
      var sel = $('[data-filter-' + key + "]", filters);
      on(sel, "change", function () { state[key] = this.value; apply(); });
    });
    on($("[data-filter-clear]", filters), "click", function () {
      state = { q: "", cat: "all", brand: "all", price: "all", grade: "all", sort: "featured" };
      if (search) { search.value = ""; }
      each($$("[data-filter-chip]", filters), function (n, c) {
        c.classList.toggle("filter-bar__chip--active", n === 0);
        c.setAttribute("aria-pressed", String(n === 0));
      });
      each(["brand", "price", "grade", "sort"], function (__, key) {
        var sel = $('[data-filter-' + key + "]", filters);
        if (sel) { sel.value = key === "sort" ? "featured" : "all"; }
      });
      apply();
    });

    apply();
    V.productModal();
  };

  /* ---------------------------------------------------- 4 product detail modal */
  V.productModal = function () {
    var modal = $("[data-pmodal]");
    if (!modal) { return; }
    var lastFocus = null;

    function find(id) {
      var out = null;
      each(H.v2.products, function (_, p) { if (p.id === id) { out = p; } });
      return out;
    }

    function render(p) {
      var thumbs = "", usage = "", opts = "", vids = "", colors = "";
      each(p.photos, function (n, ph) {
        thumbs += '<button class="pmodal__thumb' + (n === 0 ? " pmodal__thumb--active" : "") + '" type="button" data-photo="' + n + '">' + esc(ph) + "</button>";
      });
      each(p.usage, function (_, u) { usage += '<li class="pmodal__list-item">' + esc(u) + "</li>"; });
      each(p.options, function (_, o) { opts += '<li class="pmodal__list-item">' + esc(o) + "</li>"; });
      each(p.videos, function (_, v) {
        vids += '<button class="pmodal__video" type="button">' +
                  '<span class="pmodal__video-play" aria-hidden="true"></span>' +
                  '<span><span class="pmodal__video-title">' + esc(v[0]) + '</span><br /><span class="pmodal__video-meta">' + esc(v[1]) + "</span></span>" +
                "</button>";
      });
      each(p.colors, function (n, c) {
        colors += '<button class="pmodal__color' + (n === 0 ? " pmodal__color--active" : "") + '" type="button" data-color="' + esc(c[0]) + '" aria-pressed="' + (n === 0) + '">' +
                    '<span class="pmodal__color-dot" style="background:' + c[1] + '"></span>' + esc(c[0]) + "</button>";
      });

      $("[data-pmodal-title]").textContent = p.name;
      $("[data-pmodal-lede]").textContent = p.price + " · " + p.spec + " · " + p.seller;
      $("[data-pmodal-canvas]").innerHTML = '' +
        '<div class="pmodal">' +
          '<div class="pmodal__col">' +
            '<div class="pmodal__gallery">' +
              '<div class="pmodal__frame"><span class="slot" data-photo-view>[ ' + esc(p.photos[0]) + " ]</span></div>" +
              '<div class="pmodal__thumbs">' + thumbs + "</div>" +
            "</div>" +
            '<div class="pmodal__section">' +
              '<p class="pmodal__section-title">Colour / mount</p>' +
              '<div class="pmodal__colors">' + colors + "</div>" +
              '<p class="field__hint" data-color-note>Selected: ' + esc(p.colors[0][0]) + "</p>" +
            "</div>" +
          "</div>" +
          '<div class="pmodal__col">' +
            '<div class="tabs" role="tablist" aria-label="Product information">' +
              '<button class="tabs__tab tabs__tab--active" type="button" role="tab" aria-selected="true" data-tab="desc">Description</button>' +
              '<button class="tabs__tab" type="button" role="tab" aria-selected="false" data-tab="usage">Usage</button>' +
              '<button class="tabs__tab" type="button" role="tab" aria-selected="false" data-tab="opts">Options</button>' +
              '<button class="tabs__tab" type="button" role="tab" aria-selected="false" data-tab="vids">Tutorials</button>' +
            "</div>" +
            '<div class="tabs__panel" data-panel="desc">' +
              '<p class="pmodal__body">' + esc(p.description) + "</p>" +
              '<div class="receipt u-mt-3">' +
                '<div class="receipt__row"><span class="receipt__label">Serial</span><span class="receipt__value">' + esc(p.serial) + "</span></div>" +
                '<div class="receipt__row"><span class="receipt__label">Shutter</span><span class="receipt__value">' + esc(p.shutter) + "</span></div>" +
                '<div class="receipt__row"><span class="receipt__label">Warranty</span><span class="receipt__value">' + esc(p.warranty) + "</span></div>" +
              "</div>" +
            "</div>" +
            '<div class="tabs__panel" data-panel="usage" hidden><ul class="pmodal__list">' + usage + "</ul></div>" +
            '<div class="tabs__panel" data-panel="opts" hidden><ul class="pmodal__list">' + opts + "</ul></div>" +
            '<div class="tabs__panel" data-panel="vids" hidden>' +
              '<div class="pmodal__videos">' + vids + "</div>" +
              '<p class="field__hint u-mt-3">Tutorial players are placeholders in this build — drop the real embeds into the same slots.</p>' +
            "</div>" +
            '<div class="modal__actions u-mt-4">' +
              '<a class="btn btn--primary" href="index.html#delivery">Reserve with escrow</a>' +
              '<button class="btn btn--ghost" type="button" data-modal-dismiss>Keep browsing</button>' +
            "</div>" +
          "</div>" +
        "</div>";
    }

    function open(id) {
      var p = find(id);
      if (!p) { return; }
      render(p);
      lastFocus = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      var x = $(".modal__close", modal);
      if (x) { x.focus(); }
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }

    delegate("click", "[data-open-product]", function () { open(this.getAttribute("data-open-product")); });
    delegate("click", "[data-pmodal] .modal__close, [data-pmodal] .modal__backdrop, [data-pmodal] [data-modal-dismiss]", close);
    on(document, "keydown", function (e) {
      if ((e.key === "Escape" || e.keyCode === 27) && modal.classList.contains("is-open")) { close(); }
    });

    delegate("click", "[data-photo]", function () {
      var wrap = this.closest(".pmodal");
      each($$("[data-photo]", wrap), function (_, b) { b.classList.remove("pmodal__thumb--active"); });
      this.classList.add("pmodal__thumb--active");
      var view = $("[data-photo-view]", wrap);
      if (view) { view.textContent = "[ " + this.textContent + " ]"; }
    });
    delegate("click", "[data-color]", function () {
      var wrap = this.closest(".pmodal");
      each($$("[data-color]", wrap), function (_, b) { b.classList.remove("pmodal__color--active"); b.setAttribute("aria-pressed", "false"); });
      this.classList.add("pmodal__color--active");
      this.setAttribute("aria-pressed", "true");
      var note = $("[data-color-note]", wrap);
      if (note) { note.textContent = "Selected: " + this.getAttribute("data-color"); }
    });
    delegate("click", "[data-tab]", function () {
      var wrap = this.closest(".pmodal"), key = this.getAttribute("data-tab");
      each($$("[data-tab]", wrap), function (_, t) { t.classList.remove("tabs__tab--active"); t.setAttribute("aria-selected", "false"); });
      this.classList.add("tabs__tab--active");
      this.setAttribute("aria-selected", "true");
      each($$("[data-panel]", wrap), function (_, pn) { pn.hidden = pn.getAttribute("data-panel") !== key; });
    });
  };

  /* ---------------------------------------------------------- 5 feature sim */
  V.featureSim = function () {
    var tickRoot = $("[data-sim-tick]");
    if (!tickRoot) { return; }
    var checks = ["POWER ON", "SHUTTER FIRE", "SENSOR CLEAN", "GLASS CLEAR", "DIALS OK", "CARD SLOT", "BATTERY SEAT"];
    var html = "";
    each(checks, function (_, c) { html += '<span class="tick__row"><span class="tick__box"></span>' + c + "</span>"; });
    tickRoot.innerHTML = html;
    var rows = $$(".tick__row", tickRoot), k = 0;
    if (reduced()) { each(rows, function (_, r) { r.classList.add("tick__row--on"); }); return; }
    window.setInterval(function () {
      if (k >= rows.length) {
        each(rows, function (_, r) { r.classList.remove("tick__row--on"); });
        k = 0;
        return;
      }
      rows[k].classList.add("tick__row--on");
      k++;
    }, 900);
  };

  /* --------------------------------------------------------- 6 how-to screens */
  V.howto = function () {
    var list = $("[data-howto-list]"), screen = $("[data-howto-screen]");
    if (!list || !screen) { return; }
    var steps = H.v2.howto, i = 0;

    var html = "";
    each(steps, function (n, s) {
      html += '' +
        '<button class="howto__item' + (n === 0 ? " howto__item--active" : "") + '" type="button" data-howto="' + n + '" aria-pressed="' + (n === 0) + '">' +
          '<span class="howto__num">0' + (n + 1) + "</span>" +
          '<span class="howto__text"><span class="howto__label">' + esc(s.label) + '</span><span class="howto__hint">' + esc(s.hint) + "</span></span>" +
        "</button>";
    });
    list.innerHTML = html;

    var ANIM = {
      lens: '<span class="pstage pstage--lens"><span class="pstage__ring"></span><span class="pstage__iris"></span><span class="pstage__sweep"></span></span>',
      coins: '<span class="pstage pstage--coins"><span class="pstage__coin pstage__coin--1"></span><span class="pstage__coin pstage__coin--2"></span><span class="pstage__coin pstage__coin--3"></span><span class="pstage__slot"></span><span class="pstage__vault"></span></span>',
      checks: '<span class="pstage pstage--checks"><span class="pstage__line pstage__line--1"></span><span class="pstage__line pstage__line--2"></span><span class="pstage__line pstage__line--3"></span><span class="pstage__beam"></span></span>',
      route: '<span class="pstage pstage--route"><span class="pstage__path"></span><span class="pstage__from"></span><span class="pstage__to"></span><span class="pstage__rider"></span></span>',
      seal: '<span class="pstage pstage--seal"><span class="pstage__seal"></span><span class="pstage__tick"></span><span class="pstage__burst"></span></span>'
    };

    function paint() {
      var s = steps[i].screen, rows = "";
      each(s.rows, function (_, r) {
        rows += '<span class="phone__row"><span class="phone__row-label">' + esc(r[0]) + '</span><span>' + esc(r[1]) + "</span></span>";
      });
      screen.innerHTML = '' +
        '<span class="phone__bar"><span>HYBRID.CAM</span><span>STEP 0' + (i + 1) + " / 0" + steps.length + "</span></span>" +
        (ANIM[steps[i].anim] || "") +
        '<h3 class="phone__title">' + esc(s.title) + "</h3>" +
        '<p class="phone__body">' + esc(s.body) + "</p>" +
        '<span class="phone__meter"><span class="phone__meter-fill" style="width:' + s.meter + '%"></span></span>' +
        rows +
        '<button class="btn btn--primary btn--block phone__cta" type="button" data-howto-next>' + esc(s.cta) + "</button>";
      each($$("[data-howto]", list), function (n, b) {
        b.classList.toggle("howto__item--active", n === i);
        b.setAttribute("aria-pressed", String(n === i));
      });
    }
    delegate("click", "[data-howto]", function () { i = parseInt(this.getAttribute("data-howto"), 10); paint(); });
    delegate("click", "[data-howto-next]", function () { i = (i + 1) % steps.length; paint(); });
    paint();
  };

  /* ------------------------------------------------------------- 7 services */
  V.services = function () {
    var root = $("[data-services]");
    if (!root) { return; }
    var html = "";
    each(H.v2.services, function (_, s) {
      html += '' +
        '<article class="svc reveal">' +
          '<span class="svc__icon svc__icon--' + s.i + '" aria-hidden="true"></span>' +
          '<h3 class="svc__title">' + esc(s.t) + "</h3>" +
          '<p class="svc__body">' + esc(s.b) + "</p>" +
          '<span class="svc__meta">' + esc(s.m) + "</span>" +
          '<span class="svc__glow" aria-hidden="true"></span>' +
        "</article>";
    });
    root.innerHTML = html;
  };

  /* --------------------------------------------------- 8 testimonial coverflow */
  V.testimonials = function () {
    var root = $("[data-testimonials]");
    if (!root) { return; }
    var list = H.v2.testimonials, i = 2, timer = null;

    var cards = "", dots = "";
    each(list, function (n, t) {
      cards += '' +
        '<figure class="cover__card" data-cover="' + n + '">' +
          '<span class="cover__stars" aria-hidden="true">★★★★★</span>' +
          '<blockquote class="cover__quote">“' + esc(t.q) + '”</blockquote>' +
          '<figcaption class="cover__who">' +
            '<span class="cover__avatar" aria-hidden="true">' + esc(t.i) + "</span>" +
            '<span><span class="cover__name">' + esc(t.n) + '</span><span class="cover__meta">' + esc(t.m) + "</span></span>" +
          "</figcaption>" +
        "</figure>";
      dots += '<button class="cover__dot" type="button" data-cover-to="' + n + '" aria-label="Show testimonial ' + (n + 1) + '"></button>';
    });

    root.innerHTML = '' +
      '<div class="cover__stage" data-cover-stage>' + cards + "</div>" +
      '<div class="cover__controls">' +
        '<button class="slider__arrow slider__arrow--prev" type="button" data-cover-prev aria-label="Previous testimonial"><span class="slider__arrow-glyph" aria-hidden="true"></span></button>' +
        '<div class="cover__dots">' + dots + "</div>" +
        '<button class="slider__arrow slider__arrow--next" type="button" data-cover-next aria-label="Next testimonial"><span class="slider__arrow-glyph" aria-hidden="true"></span></button>' +
      "</div>";

    var nodes = $$("[data-cover]", root);

    function paint() {
      each(nodes, function (n, node) {
        var d = n - i, cls = "cover__card";
        if (d === 0) { cls += " cover__card--active"; }
        else if (d === -1) { cls += " cover__card--prev"; }
        else if (d === 1) { cls += " cover__card--next"; }
        else { cls += d < 0 ? " cover__card--far-prev" : " cover__card--far-next"; }
        node.className = cls;
        node.setAttribute("aria-hidden", d === 0 ? "false" : "true");
      });
      each($$("[data-cover-to]", root), function (n, d) {
        d.classList.toggle("cover__dot--active", n === i);
        if (n === i) { d.setAttribute("aria-current", "true"); } else { d.removeAttribute("aria-current"); }
      });
    }
    function go(n) {
      i = Math.max(0, Math.min(list.length - 1, n));
      paint();
    }
    function next() { i = (i + 1) % list.length; paint(); }
    function play() { if (reduced()) { return; } stop(); timer = window.setInterval(next, 5600); }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    on($("[data-cover-next]", root), "click", function () { next(); play(); });
    on($("[data-cover-prev]", root), "click", function () { go(i === 0 ? list.length - 1 : i - 1); play(); });
    each($$("[data-cover-to]", root), function (n, d) { on(d, "click", function () { go(n); play(); }); });
    each(nodes, function (n, node) { on(node, "click", function () { if (n !== i) { go(n); play(); } }); });
    on(root, "mouseenter", stop);
    on(root, "mouseleave", play);
    on(root, "focusin", stop);

    /* touch swipe */
    var x0 = null;
    on(root, "touchstart", function (e) { x0 = e.touches[0].clientX; stop(); });
    on(root, "touchend", function (e) {
      if (x0 === null) { return; }
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); }
      x0 = null;
      play();
    });

    paint();
    play();
  };

  /* ---------------------------------------------------------- 9 promo popup */
  V.promo = function () {
    var promo = $("[data-promo]");
    if (!promo) { return; }
    var key = "hc-promo-" + (promo.getAttribute("data-promo") || "v2");
    if (store(key) !== "dismissed") {
      window.setTimeout(function () { promo.classList.add("promo--open"); }, 4200);
    }
    delegate("click", "[data-promo-close]", function () {
      promo.classList.remove("promo--open");
      store(key, "dismissed");
    });
    delegate("click", "[data-promo-copy]", function () {
      var btn = this, code = (btn.getAttribute("data-code") || promo.getAttribute("data-code") || "").trim();
      copyText(code).then(function (ok) {
        var was = btn.textContent;
        btn.textContent = ok ? "Copied ✓" : "Copy failed";
        window.setTimeout(function () { btn.textContent = was; }, 2000);
      });
    });
  };

  /* --------------------------------------------------------- 10 clipboard */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(text); });
    }
    return Promise.resolve(legacy(text));
  }
  function legacy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  H.copyText = copyText;

  /* -------------------------------------------------- 11 channel tabs + wizard */
  V.channel = function () {
    var tabs = $$("[data-channel-tab]");
    if (tabs.length) {
      each(tabs, function (_, tab) {
        on(tab, "click", function () {
          var key = tab.getAttribute("data-channel-tab");
          each(tabs, function (__, t) {
            var active = t === tab;
            t.classList.toggle("ptab--active", active);
            t.setAttribute("aria-selected", String(active));
            t.setAttribute("tabindex", active ? "0" : "-1");
          });
          each($$("[data-channel-pane]"), function (__, pane) {
            pane.hidden = pane.getAttribute("data-channel-pane") !== key;
          });
          if (H.wizard) { H.wizard.setMode(key); }
        });
        on(tab, "keydown", function (e) {
          var n = tabs.indexOf(tab);
          if (e.key === "ArrowRight") { tabs[(n + 1) % tabs.length].focus(); tabs[(n + 1) % tabs.length].click(); }
          if (e.key === "ArrowLeft") { tabs[(n + tabs.length - 1) % tabs.length].focus(); tabs[(n + tabs.length - 1) % tabs.length].click(); }
        });
      });
    }
  };

  V.wizard = function () {
    var form = $("[data-wizard]");
    if (!form) { return; }
    var steps = $$("[data-step-panel]", form), i = 0, mode = "standard", faceOk = false;
    var rail = $("[data-wizard-rail]", form);

    function paint() {
      each(steps, function (n, s) { s.hidden = n !== i; });
      each($$(".wizard__pip", rail), function (n, p) {
        p.classList.toggle("wizard__pip--active", n === i);
        p.classList.toggle("wizard__pip--done", n < i);
      });
      var back = $("[data-wizard-back]", form), next = $("[data-wizard-next]", form);
      if (back) { back.disabled = i === 0; }
      if (next) {
        next.textContent = i === steps.length - 2 ? "Confirm order" : (i === steps.length - 1 ? "Start another" : "Continue");
      }
      var live = $("[data-wizard-live]", form);
      if (live) { live.textContent = "Step " + (i + 1) + " of " + steps.length + " · " + (steps[i].getAttribute("data-step-name") || ""); }
      var bar = $("[data-wizard-bar]", form);
      if (bar) { bar.style.width = (((i + 1) / steps.length) * 100) + "%"; }
    }

    function validate() {
      var panel = steps[i], ok = true;
      each($$("[data-required]", panel), function (_, input) {
        if (input.closest("[hidden]")) { return; }
        var field = input.closest(".field"), val = (input.value || "").trim();
        var bad = !val ||
          (input.type === "email" && val.indexOf("@") < 1) ||
          (input.getAttribute("data-required") === "phone" && val.replace(/\D/g, "").length < 10);
        if (field) { field.classList.toggle("field--invalid", bad); }
        var err = field ? $(".field__error", field) : null;
        if (err) { err.hidden = !bad; }
        input.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && ok) { input.focus(); }
        if (bad) { ok = false; }
      });
      /* the verification step also needs the face scan + a 4-digit OTP */
      if (ok && panel.getAttribute("data-step-name") === "Verification") {
        var digits = 0;
        each($$(".otp__slot", panel), function (_, s) { if ((s.value || "").trim()) { digits++; } });
        var note = $("[data-verify-note]", panel);
        if (!faceOk || digits < 4) {
          if (note) {
            note.hidden = false;
            note.textContent = !faceOk ? "Run the face scan to continue — it takes about three seconds." : "Enter all four OTP digits to continue.";
            note.focus();
          }
          ok = false;
        } else if (note) { note.hidden = true; }
      }
      return ok;
    }

    function fillReceipt() {
      var get = function (name) {
        var el = form.querySelector('[name="' + name + '"]');
        return el ? ((el.value || "").trim() || "—") : "—";
      };
      var spot = $(".meetup__spot--active"), slot = $(".meetup__slot--active");
      var rows = [
        ["Reference", "HC-" + String(Math.floor(Math.random() * 90000) + 10000) + "-MNL"],
        ["Unit", get("unit")],
        ["Buyer", get("name")],
        ["Contact", get("phone")],
        ["Channel", mode === "standard" ? "Standard doorstep delivery" : "Scheduled meet-up"],
        [mode === "standard" ? "Address" : "Meet point", mode === "standard" ? get("address") : (spot ? spot.getAttribute("data-spot-name") : "Arellano School, San Miguel")],
        ["Window", mode === "standard" ? get("window") : (slot ? slot.textContent : "11:30")],
        ["Verification", "ID reference + face scan + OTP"],
        ["Escrow", "Held until delivery OTP"]
      ];
      var html = "";
      each(rows, function (_, r) {
        html += '<div class="receipt__row"><span class="receipt__label">' + esc(r[0]) + '</span><span class="receipt__value">' + esc(r[1]) + "</span></div>";
      });
      var out = $("[data-wizard-receipt]", form);
      if (out) { out.innerHTML = html; }
    }

    on($("[data-wizard-next]", form), "click", function () {
      if (i === steps.length - 1) { i = 0; paint(); return; }
      if (!validate()) { return; }
      if (i === steps.length - 2) { fillReceipt(); }
      i++;
      paint();
    });
    on($("[data-wizard-back]", form), "click", function () { if (i > 0) { i--; paint(); } });
    on(form, "submit", function (e) { e.preventDefault(); });

    /* face scan simulation */
    var scan = $("[data-face]", form);
    if (scan) {
      on($("[data-face-start]", form), "click", function () {
        var btn = this, meter = $("[data-face-meter]", form), state = $("[data-face-state]", form), pct = 0;
        btn.disabled = true;
        scan.classList.add("face--scanning");
        scan.classList.remove("face--done");
        var t = window.setInterval(function () {
          pct += reduced() ? 34 : 7;
          if (meter) { meter.style.width = Math.min(100, pct) + "%"; }
          if (state) { state.textContent = pct < 40 ? "Centring your face…" : (pct < 80 ? "Checking liveness…" : "Matching to your ID…"); }
          if (pct >= 100) {
            window.clearInterval(t);
            faceOk = true;
            btn.disabled = false;
            btn.textContent = "Re-scan";
            scan.classList.remove("face--scanning");
            scan.classList.add("face--done");
            if (state) { state.textContent = "Face verified · matched to ID reference"; }
          }
        }, 120);
      });
    }

    each($$(".otp__slot", form), function (n, slot) {
      on(slot, "input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 1);
        var slots = $$(".otp__slot", form);
        if (this.value && slots[n + 1]) { slots[n + 1].focus(); }
      });
      on(slot, "keydown", function (e) {
        var slots = $$(".otp__slot", form);
        if ((e.key === "Backspace") && !this.value && slots[n - 1]) { slots[n - 1].focus(); }
      });
    });

    H.wizard = {
      setMode: function (m) {
        mode = m;
        each($$("[data-route-pane]", form), function (_, p) {
          p.hidden = p.getAttribute("data-route-pane") !== m;
        });
      }
    };
    H.wizard.setMode("standard");
    paint();
  };

  /* ------------------------------------------------------- 12 meetup picker */
  V.meetup = function () {
    var list = $("[data-meetup-list]");
    if (!list) { return; }
    var html = "";
    each(H.v2.spots, function (n, s) {
      var slots = "";
      each(s.slots, function (m, t) {
        var on2 = n === 0 && m === 1;
        slots += '<button class="meetup__slot' + (on2 ? " meetup__slot--active" : "") + '" type="button" data-slot aria-pressed="' + on2 + '">' + t + "</button>";
      });
      html += '' +
        '<div class="meetup__row">' +
          '<button class="meetup__spot' + (n === 0 ? " meetup__spot--active" : "") + '" type="button" data-spot="' + s.id + '" ' +
                 'data-spot-name="' + esc(s.name) + '" data-lng="' + s.lng + '" data-lat="' + s.lat + '" aria-pressed="' + (n === 0) + '">' +
            '<span class="meetup__spot-name">' + esc(s.name) + "</span>" +
            '<span class="meetup__spot-meta">' + esc(s.meta) + "</span>" +
          "</button>" +
          '<div class="meetup__slots" role="group" aria-label="Windows for ' + esc(s.name) + '">' + slots + "</div>" +
        "</div>";
    });
    list.innerHTML = html;

    delegate("click", "[data-spot]", function () {
      each($$("[data-spot]"), function (_, b) { b.classList.remove("meetup__spot--active"); b.setAttribute("aria-pressed", "false"); });
      this.classList.add("meetup__spot--active");
      this.setAttribute("aria-pressed", "true");
      if (H.map && H.map.focusSpot) {
        H.map.focusSpot(parseFloat(this.getAttribute("data-lng")), parseFloat(this.getAttribute("data-lat")), this.getAttribute("data-spot-name"));
      }
    });
    delegate("click", "[data-slot]", function () {
      var wrap = this.parentNode;
      each($$("[data-slot]", wrap), function (_, b) { b.classList.remove("meetup__slot--active"); b.setAttribute("aria-pressed", "false"); });
      this.classList.add("meetup__slot--active");
      this.setAttribute("aria-pressed", "true");
    });
  };

  /* ------------------------------------------------------------ 13 MapLibre */
  V.map = function () {
    var host = $("[data-map]");
    if (!host) { return; }
    var mode = host.getAttribute("data-map") || "meetup";

    if (typeof window.maplibregl === "undefined") {
      host.innerHTML = '<span class="map__fallback">[ live map unavailable offline — the status panel beside it stays live ]</span>';
      return;
    }

    var style = {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap contributors"
        }
      },
      layers: [{ id: "osm", type: "raster", source: "osm" }]
    };

    var map;
    try {
      map = new window.maplibregl.Map({
        container: host,
        style: style,
        center: mode === "track" ? [120.9871, 14.5945] : [120.9905, 14.5985],
        zoom: mode === "track" ? 13.4 : 11.6,
        attributionControl: true
      });
    } catch (err) {
      host.innerHTML = '<span class="map__fallback">[ map failed to initialise — status panel still live ]</span>';
      return;
    }

    map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), "top-right");
    var canvas = map.getCanvas();
    canvas.setAttribute("tabindex", "0");
    canvas.setAttribute("aria-label", mode === "track" ? "Live rider tracking map" : "Meet-up locations map");

    /* labelled pin: dot + name card + status line (tooltip on hover) */
    function pin(kind, name, status) {
      var el = document.createElement("div");
      el.className = "mpin mpin--" + kind;
      el.setAttribute("title", name + " — " + status);
      el.innerHTML = '' +
        '<span class="mpin__dot"></span>' +
        '<span class="mpin__card"><span class="mpin__name">' + esc(name) + '</span><span class="mpin__status">' + esc(status) + "</span></span>";
      return el;
    }

    H.map = H.map || {};

    if (mode === "meetup") {
      var markers = {};
      each(H.v2.spots, function (n, s) {
        var el = pin(n === 0 ? "meet" : "spot", s.name, s.meta);
        markers[s.id] = new window.maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([s.lng, s.lat]).addTo(map);
      });
      H.map.focusSpot = function (lng, lat, name) {
        map.flyTo({ center: [lng, lat], zoom: 14.2, speed: 0.9 });
        each(H.v2.spots, function (_, s) {
          var el = markers[s.id] && markers[s.id].getElement();
          if (el) { el.classList.toggle("mpin--meet", s.name === name); el.classList.toggle("mpin--spot", s.name !== name); }
        });
      };
      return;
    }

    var route = H.v2.route;
    var rider = new window.maplibregl.Marker({ element: pin("rider", "Rider HC-R-2291", "En route · sealed unit"), anchor: "bottom" })
      .setLngLat(route[0]).addTo(map);
    new window.maplibregl.Marker({ element: pin("seller", "Seller · Manila Camera Lab", "Handed over · verified"), anchor: "bottom" })
      .setLngLat(route[0]).addTo(map);
    new window.maplibregl.Marker({ element: pin("buyer", "Buyer (You)", "Waiting at drop-off"), anchor: "bottom" })
      .setLngLat(route[route.length - 1]).addTo(map);

    map.on("load", function () {
      map.addSource("route", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: route } } });
      map.addLayer({
        id: "route-casing", type: "line", source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#0b1020", "line-width": 9, "line-opacity": 0.55 }
      });
      map.addLayer({
        id: "route-line", type: "line", source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ff4d97", "line-width": 4 }
      });
      map.fitBounds([route[0], route[route.length - 1]], { padding: 90, duration: 0 });
    });

    var etaOut = $("[data-track-eta]"), distOut = $("[data-track-dist]"), stateOut = $("[data-track-state]"),
        clockOut = $("[data-track-clock]"), riderDist = $("[data-rider-dist]");
    var seg = 0, t = 0;

    function lerp(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }

    function tick() {
      t += 0.02;
      if (t >= 1) { t = 0; seg = (seg + 1) % (route.length - 1); }
      rider.setLngLat(lerp(route[seg], route[seg + 1], t));
      var progress = (seg + t) / (route.length - 1);
      var km = (3.2 * (1 - progress));
      if (etaOut) { etaOut.textContent = Math.max(1, Math.round(14 * (1 - progress))) + " min"; }
      if (distOut) { distOut.textContent = km.toFixed(1) + " km"; }
      if (riderDist) { riderDist.textContent = "Distance: " + km.toFixed(1) + " km"; }
      if (stateOut) { stateOut.textContent = progress > 0.86 ? "Arriving · prepare your OTP" : "In transit · sealed unit"; }
      var el = rider.getElement && rider.getElement();
      var st = el && el.querySelector(".mpin__status");
      if (st) { st.textContent = progress > 0.86 ? "Arriving · " + km.toFixed(1) + " km" : "En route · " + km.toFixed(1) + " km"; }
      if (clockOut) {
        var d = new Date();
        clockOut.textContent = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      }
    }
    tick();
    if (!reduced()) { window.setInterval(tick, 260); }
  };

  /* ---------------------------------------------------- 14 status timeline */
  V.timeline = function () {
    var root = $("[data-timeline]");
    if (!root) { return; }
    var html = "";
    each(H.v2.trackStates, function (_, s) {
      html += '' +
        '<li class="timeline__item timeline__item--' + s.s + '">' +
          '<span class="timeline__title">' + esc(s.t) + "</span>" +
          '<span class="timeline__meta">' + esc(s.m) + "</span>" +
        "</li>";
    });
    root.innerHTML = html;
  };

  /* --------------------------------------------------------- 15 contact desk */
  V.contact = function () {
    var desk = $("[data-desk]");
    if (!desk) { return; }

    /* topic chips write into the live ticket preview */
    var ticket = { topic: "Buying a listed unit", unit: "—", name: "—", channel: "Email" };
    function paintTicket() {
      var out = $("[data-ticket]");
      if (!out) { return; }
      out.innerHTML = '' +
        '<div class="receipt__row"><span class="receipt__label">Topic</span><span class="receipt__value">' + esc(ticket.topic) + "</span></div>" +
        '<div class="receipt__row"><span class="receipt__label">Unit / order</span><span class="receipt__value">' + esc(ticket.unit) + "</span></div>" +
        '<div class="receipt__row"><span class="receipt__label">From</span><span class="receipt__value">' + esc(ticket.name) + "</span></div>" +
        '<div class="receipt__row"><span class="receipt__label">Reply on</span><span class="receipt__value">' + esc(ticket.channel) + "</span></div>";
    }

    each($$("[data-topic]", desk), function (_, chip) {
      on(chip, "click", function () {
        each($$("[data-topic]", desk), function (__, c) {
          c.classList.remove("filter-bar__chip--active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("filter-bar__chip--active");
        chip.setAttribute("aria-pressed", "true");
        ticket.topic = chip.textContent.trim();
        paintTicket();
      });
    });
    each($$("[data-ticket-field]", desk), function (_, input) {
      on(input, "input", function () {
        ticket[input.getAttribute("data-ticket-field")] = (input.value || "").trim() || "—";
        paintTicket();
      });
      on(input, "change", function () {
        ticket[input.getAttribute("data-ticket-field")] = (input.value || "").trim() || "—";
        paintTicket();
      });
    });
    var form = $("[data-desk-form]", desk);

    function checkField(input, show) {
      var field = input.closest(".field"), val = (input.value || "").trim();
      var bad = !val;
      if (field) { field.classList.toggle("field--invalid", bad && show); }
      var err = field ? $(".field__error", field) : null;
      if (err) { err.hidden = !(bad && show); }
      input.setAttribute("aria-invalid", bad && show ? "true" : "false");
      return !bad;
    }

    each($$("[data-required]", form), function (_, input) {
      on(input, "blur", function () { checkField(input, true); });
      on(input, "input", function () {
        if (input.closest(".field").classList.contains("field--invalid")) { checkField(input, true); }
      });
    });

    on(form, "submit", function (e) {
      e.preventDefault();
      var ok = true, first = null;
      each($$("[data-required]", form), function (_, input) {
        if (!checkField(input, true)) { ok = false; if (!first) { first = input; } }
      });
      var note = $("[data-desk-note]", desk);
      if (!ok) {
        if (note) { note.hidden = true; }
        if (first) { first.focus(); }
        return;
      }
      if (note) { note.hidden = false; note.focus(); }
    });
    paintTicket();
  };

  /* -------------------------------------------------------------------- boot */
  function boot() {
    V.slider();
    V.story();
    V.products();
    V.services();
    V.featureSim();
    V.howto();
    V.testimonials();
    V.promo();
    V.channel();
    V.wizard();
    V.meetup();
    V.timeline();
    V.contact();
    V.map();
    if (H.modules && H.modules.reveal) { H.modules.reveal(); }
  }

  H.v2modules = V;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, false);
  } else {
    boot();
  }
})(window.HYBRID = window.HYBRID || {});
