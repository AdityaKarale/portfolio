(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  // ---------- Nav ----------
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setMenu(false);
      navId.classList.remove("is-open");
      if (navId.contains(document.activeElement)) document.activeElement.blur();
    }
  });

  // ---------- Contact card (tap to open on touch screens) ----------
  var navId = document.getElementById("navId");
  var navBrand = document.getElementById("navBrand");
  var noHover = window.matchMedia("(hover: none)");
  navBrand.addEventListener("click", function (e) {
    if (!noHover.matches) return;
    if (!navId.classList.contains("is-open")) {
      e.preventDefault();
      navId.classList.add("is-open");
    }
  });
  document.addEventListener("click", function (e) {
    if (!navId.contains(e.target)) navId.classList.remove("is-open");
  });

  // ---------- Active section (none while on the hero) ----------
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  var tracked = [document.getElementById("top")].concat(
    links.map(function (a) { return document.querySelector(a.getAttribute("href")); })
  ).filter(Boolean);

  if (hasIO) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    tracked.forEach(function (s) { sectionObserver.observe(s); });
  }

  // ---------- Count-up numbers ----------
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var format = function (n) {
      return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };
    if (reduceMotion) { el.textContent = format(target); return; }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = clamp((ts - start) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- Reveal on scroll ----------
  var reveals = document.querySelectorAll(".reveal");
  if (hasIO && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-count]").forEach(countUp);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ---------- Hero role rotator ----------
  var rotator = document.getElementById("rotator");
  var roles = ["Platform Engineer", "SRE", "Observability Specialist", "DevOps Engineer"];
  if (rotator && !reduceMotion) {
    var i = 0;
    setInterval(function () {
      rotator.classList.add("is-out");
      setTimeout(function () {
        i = (i + 1) % roles.length;
        rotator.textContent = roles[i];
        rotator.classList.remove("is-out");
        rotator.classList.add("is-in");
        void rotator.offsetWidth;
        rotator.classList.remove("is-in");
      }, 450);
    }, 2600);
  }

  // ---------- Scroll-scrubbed statement ----------
  var scrub = document.querySelector("[data-scrub]");
  var words = [];
  if (scrub && !reduceMotion) {
    var text = scrub.textContent.trim().split(/\s+/);
    scrub.textContent = "";
    text.forEach(function (w, idx) {
      var span = document.createElement("span");
      span.className = "w";
      span.textContent = w;
      scrub.appendChild(span);
      if (idx < text.length - 1) scrub.appendChild(document.createTextNode(" "));
      words.push(span);
    });
  }

  // ---------- OCCNXT zoom ----------
  var zoom = document.querySelector("[data-zoom]");
  var mock = zoom ? zoom.querySelector(".mock") : null;
  var zoomEnabled = function () { return !reduceMotion && window.innerWidth > 734; };

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight;

      nav.classList.toggle("is-scrolled", window.scrollY > 10);

      if (words.length) {
        var r = scrub.getBoundingClientRect();
        var start = vh * 0.85;
        var end = vh * 0.35;
        var p = clamp((start - r.top) / (r.height + start - end), 0, 1);
        var lit = Math.round(p * words.length);
        for (var k = 0; k < words.length; k++) words[k].classList.toggle("on", k < lit);
      }

      if (mock && zoomEnabled()) {
        var zr = zoom.getBoundingClientRect();
        var zp = clamp(1 - (zr.top - 48) / (vh * 0.75), 0, 1);
        mock.style.setProperty("--p", zp.toFixed(3));
      }
    });
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // ---------- Projects gallery ----------
  var gallery = document.getElementById("gallery");
  var prev = document.querySelector('[data-gallery="prev"]');
  var next = document.querySelector('[data-gallery="next"]');
  if (gallery && prev && next) {
    var cardStep = function () {
      var card = gallery.querySelector(".gcard");
      return card ? card.getBoundingClientRect().width + 20 : 400;
    };
    var updateButtons = function () {
      prev.disabled = gallery.scrollLeft <= 4;
      next.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 4;
    };
    prev.addEventListener("click", function () { gallery.scrollBy({ left: -cardStep(), behavior: "smooth" }); });
    next.addEventListener("click", function () { gallery.scrollBy({ left: cardStep(), behavior: "smooth" }); });
    gallery.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  }

  // ---------- Footer year ----------
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
