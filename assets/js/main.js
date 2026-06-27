/* =========================================================
   Suyu (Michael) Ye — site interactions
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ----------  Theme toggle  ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var THEME_BAR = { dark: "#0b1220", light: "#0f766e" };

  function syncThemeColorMeta(theme) {
    var m = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "theme-color");
      document.head.appendChild(m);
    }
    m.setAttribute("content", THEME_BAR[theme] || THEME_BAR.light);
  }

  function reflectTheme(theme) {
    if (themeToggle) themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    syncThemeColorMeta(theme);
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
    reflectTheme(theme);
  }

  // Reflect the theme the pre-paint script already applied.
  reflectTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }
  // Follow system changes only when the user hasn't chosen explicitly.
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var onSchemeChange = function (e) {
    var hasStored;
    try { hasStored = localStorage.getItem("theme"); } catch (err) { hasStored = null; }
    if (!hasStored) {
      var theme = e.matches ? "dark" : "light";
      root.setAttribute("data-theme", theme);
      reflectTheme(theme);
    }
  };
  if (media.addEventListener) media.addEventListener("change", onSchemeChange);
  else if (media.addListener) media.addListener(onSchemeChange);

  /* ----------  Mobile nav  ---------- */
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");
  function closeMenu() {
    if (!navLinks) return;
    var wasOpen = navLinks.classList.contains("is-open");
    var focusInside = navLinks.contains(document.activeElement);
    navLinks.classList.remove("is-open");
    if (burger) {
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
      // Return focus to the trigger only when driven from inside the menu
      // (Escape / keyboard close), not on link-activated navigation.
      if (wasOpen && focusInside) burger.focus();
    }
  }
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        var first = navLinks.querySelector(".nav__link");
        if (first) first.focus();
      }
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }

  /* ----------  Nav shadow + back-to-top visibility  ---------- */
  var nav = document.getElementById("nav");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ----------  Scrollspy (active nav link)  ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = links
    .map(function (l) {
      var id = l.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          links.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ----------  Reveal on scroll  ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && reveals.length) {
    var revObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) { revObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ----------  Cite / BibTeX modal  ---------- */
  var modal = document.getElementById("citeModal");
  var citeCode = document.getElementById("citeCode");
  var citeCopy = document.getElementById("citeCopy");
  var lastFocused = null;

  function getFocusable() {
    if (!modal) return [];
    var panel = modal.querySelector(".modal__panel") || modal;
    var nodes = panel.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(nodes, function (el) {
      return el.offsetParent !== null || el.getClientRects().length > 0;
    });
  }

  function openModal(bibtex) {
    if (!modal || !citeCode) return;
    citeCode.textContent = bibtex;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    resetCopyButton();
    var closeBtn = modal.querySelector("[data-close]");
    if (closeBtn) closeBtn.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  function resetCopyButton() {
    if (!citeCopy) return;
    var span = citeCopy.querySelector("span");
    if (span) span.textContent = "Copy BibTeX";
    citeCopy.classList.remove("btn--ok");
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-cite]");
    if (trigger) {
      var id = trigger.getAttribute("data-cite");
      var node = document.getElementById(id);
      if (node) openModal(node.textContent.trim());
      return;
    }
    if (e.target.closest("[data-close]")) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    // Close the mobile menu on Escape.
    if (e.key === "Escape" && navLinks && navLinks.classList.contains("is-open")) {
      closeMenu();
      return;
    }
    if (!modal || modal.hidden) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var f = getFocusable();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0];
      var last = f[f.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && (active === first || !modal.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !modal.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (err) { reject(err); }
    });
  }

  if (citeCopy) {
    citeCopy.addEventListener("click", function () {
      copyText(citeCode.textContent).then(function () {
        var span = citeCopy.querySelector("span");
        if (span) span.textContent = "Copied!";
        citeCopy.classList.add("btn--ok");
        setTimeout(resetCopyButton, 1800);
      }).catch(function () {
        var span = citeCopy.querySelector("span");
        if (span) span.textContent = "Press Ctrl/Cmd+C";
        setTimeout(resetCopyButton, 2500);
      });
    });
  }

  /* ----------  Footer year  ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    var now = new Date();
    yearEl.textContent = String(now.getFullYear());
  }
})();
