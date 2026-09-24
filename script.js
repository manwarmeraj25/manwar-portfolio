/* ============================================================
   Manwar Meraj — Portfolio
   Progressive enhancement only. The page is fully functional
   with JavaScript disabled; this file adds interactivity & FX.
   ============================================================ */
(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.add("js"); // enables reveal animations only when JS is present

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var canFX = finePointer && !reduceMotion;

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById("themeToggle");
  function currentTheme() {
    return docEl.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      docEl.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "light" ? "#f7f8fb" : "#0e1117");
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  function closeNav() {
    if (!navMenu) return;
    navMenu.classList.remove("open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navMenu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    document.addEventListener("click", function (e) {
      if (navMenu.classList.contains("open") &&
          !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Staggered scroll-in reveal ---------- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  // per-parent index so grid items cascade in
  var seen = new Map();
  reveals.forEach(function (el) {
    var p = el.parentNode;
    var i = seen.get(p) || 0;
    el.style.setProperty("--d", Math.min(i, 6) * 70 + "ms");
    seen.set(p, i + 1);
  });

  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Active nav link (scroll spy) ---------- */
  var sections = [].slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = [].slice.call(document.querySelectorAll(".nav-menu a"));
  var linkById = {};
  navLinks.forEach(function (a) { linkById[a.getAttribute("href").replace("#", "")] = a; });
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkById[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove("active"); });
          link.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Scroll progress bar + back-to-top ---------- */
  var bar = document.getElementById("scrollBar");
  var toTop = document.getElementById("toTop");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var st = window.pageYOffset || docEl.scrollTop;
      var h = docEl.scrollHeight - docEl.clientHeight;
      var pct = h > 0 ? (st / h) * 100 : 0;
      if (bar) bar.style.width = pct.toFixed(2) + "%";
      if (toTop) toTop.classList.toggle("show", st > 500);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Count-up stats ---------- */
  var statEls = [].slice.call(document.querySelectorAll(".hero-stats strong[data-count]"));
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    window.requestAnimationFrame(step);
  }
  if (statEls.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    statEls.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Custom cursor (dot + trailing ring) ---------- */
  var cDot = document.getElementById("cursorDot");
  var cRing = document.getElementById("cursorRing");
  if (cDot && cRing && canFX) {
    var mx = 0, my = 0, rx = 0, ry = 0, started = false;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      mx = e.clientX; my = e.clientY;
      if (!started) {
        started = true; rx = mx; ry = my;
        cDot.classList.add("on"); cRing.classList.add("on");
        loop();
      }
      cDot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    }, { passive: true });
    function loop() {
      rx += (mx - rx) * 0.18;   // easing for trailing ring
      ry += (my - ry) * 0.18;
      cRing.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) translate(-50%,-50%)";
      window.requestAnimationFrame(loop);
    }
    document.addEventListener("mouseleave", function () {
      cDot.classList.remove("on"); cRing.classList.remove("on");
    });
    document.addEventListener("mouseenter", function () {
      if (started) { cDot.classList.add("on"); cRing.classList.add("on"); }
    });
    // Grow ring over interactive elements
    var interactive = "a, button, .tilt, input, [role='button']";
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest && e.target.closest(interactive)) cRing.classList.add("grow");
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest && e.target.closest(interactive)) cRing.classList.remove("grow");
    });
  }

  /* ---------- Hero particle constellation ---------- */
  var canvas = document.getElementById("heroCanvas");
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, particles = [], linkDist = 130, pointer = { x: -9999, y: -9999 };
    var accent = getComputedStyle(docEl).getPropertyValue("--accent").trim() || "#8b7bff";

    function rgb() {
      // resolve accent (hex) to "r,g,b"
      var c = accent;
      if (c[0] === "#") {
        var h = c.slice(1);
        if (h.length === 3) h = h.split("").map(function (x) { return x + x; }).join("");
        var n = parseInt(h, 16);
        return (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255);
      }
      return "139,123,255";
    }
    var COL = rgb();

    function resize() {
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(Math.floor((W * H) / 13000), 80);
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        // gentle pull toward pointer
        var dxp = pointer.x - p.x, dyp = pointer.y - p.y;
        var dp = Math.sqrt(dxp * dxp + dyp * dyp);
        if (dp < 160) { p.x += dxp / dp * 0.4; p.y += dyp / dp * 0.4; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + COL + ",0.75)";
        ctx.fill();
      }
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x, dy = particles[a].y - particles[b].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = "rgba(" + COL + "," + (0.16 * (1 - d / linkDist)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    var onScreen = true, pageVisible = true, looping = false;
    function frame() {
      if (!onScreen || !pageVisible) { looping = false; return; }
      looping = true; draw(); window.requestAnimationFrame(frame);
    }
    function start() { if (onScreen && pageVisible && !looping) frame(); }
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", function () { pointer.x = -9999; pointer.y = -9999; });
    window.addEventListener("resize", resize, { passive: true });
    // pause when hero off-screen to save CPU
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (ents) {
        onScreen = ents[0].isIntersecting; start();
      }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      pageVisible = !document.hidden; start();
    });
    resize();
    start();
  }

  /* ---------- Typewriter rotating line ---------- */
  var typed = document.getElementById("typed");
  if (typed) {
    var phrases = [
      "backend APIs", "ASP.NET Core services", "high-performance microservices",
      "Redis-cached endpoints", "AI-assisted dev workflows", "and leading great teams"
    ];
    if (reduceMotion) {
      typed.textContent = "backend APIs & AI-assisted workflows";
    } else {
      var pi = 0, ci = 0, deleting = false;
      (function tick() {
        var word = phrases[pi];
        typed.textContent = word.slice(0, ci);
        if (!deleting) {
          if (ci < word.length) { ci++; setTimeout(tick, 70); }
          else { deleting = true; setTimeout(tick, 1500); }
        } else {
          if (ci > 0) { ci--; setTimeout(tick, 34); }
          else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 320); }
        }
      })();
    }
  }

  /* ---------- Card tilt + inner spotlight ---------- */
  if (canFX) {
    var cards = [].slice.call(document.querySelectorAll(
      ".skill-card, .ai-card, .project-card, .edu-card, .timeline-content"
    ));
    cards.forEach(function (card) {
      card.classList.add("tilt");
      var raf = false, ex = 0, ey = 0, rect = null;
      card.addEventListener("pointerenter", function () {
        rect = card.getBoundingClientRect();
        card.style.setProperty("--ty", "-6px");
      });
      card.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        ex = e.clientX; ey = e.clientY;
        if (raf) return;
        raf = true;
        window.requestAnimationFrame(function () {
          if (!rect) rect = card.getBoundingClientRect();
          var px = (ex - rect.left) / rect.width;   // 0..1
          var py = (ey - rect.top) / rect.height;   // 0..1
          var max = 5;                              // deg
          card.style.setProperty("--ry", ((px - 0.5) * 2 * max).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - py) * 2 * max).toFixed(2) + "deg");
          card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          raf = false;
        });
      });
      card.addEventListener("pointerleave", function () {
        rect = null;
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--ty", "0px");
      });
    });
  }

  /* ---------- Magnetic buttons & icons ---------- */
  if (canFX) {
    var magnets = [].slice.call(document.querySelectorAll(".btn, .to-top, .social a, .theme-toggle"));
    magnets.forEach(function (el) {
      var raf = false, mx = 0, my = 0, rect = null;
      el.addEventListener("pointerenter", function () { rect = el.getBoundingClientRect(); });
      el.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch" || !rect) return;
        mx = e.clientX - (rect.left + rect.width / 2);
        my = e.clientY - (rect.top + rect.height / 2);
        if (raf) return;
        raf = true;
        window.requestAnimationFrame(function () {
          el.style.transform = "translate(" + (mx * 0.25).toFixed(1) + "px," + (my * 0.35).toFixed(1) + "px)";
          raf = false;
        });
      });
      el.addEventListener("pointerleave", function () {
        rect = null;
        el.style.transform = "";
      });
    });
  }

  /* ---------- Animated code editor reveal (Skills) ---------- */
  var codeBody = document.getElementById("codeBody");
  var codeTerm = document.getElementById("codeTerm");
  if (codeBody) {
    var codeLines = [].slice.call(codeBody.querySelectorAll(".cl"));
    var termLines = codeTerm ? [].slice.call(codeTerm.querySelectorAll(".tl")) : [];
    function playCode() {
      if (reduceMotion) {
        codeLines.forEach(function (l) { l.classList.add("lit"); });
        termLines.forEach(function (t) { t.classList.add("lit"); });
        return;
      }
      var i = 0;
      (function nextLine() {
        if (i < codeLines.length) {
          codeLines[i].classList.add("lit"); i++;
          setTimeout(nextLine, 120);
        } else {
          var j = 0;
          (function nextTerm() {
            if (j < termLines.length) {
              termLines[j].classList.add("lit"); j++;
              setTimeout(nextTerm, 450);
            }
          })();
        }
      })();
    }
    if ("IntersectionObserver" in window) {
      var pio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { playCode(); pio.disconnect(); } });
      }, { threshold: 0.3 });
      pio.observe(codeBody);
    } else { playCode(); }
  }

  /* ---------- Button click ripple ---------- */
  var rippleBtns = [].slice.call(document.querySelectorAll(".btn"));
  rippleBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (reduceMotion) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2;
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = (e.clientX - rect.left) + "px";
      span.style.top = (e.clientY - rect.top) + "px";
      btn.appendChild(span);
      span.addEventListener("animationend", function () { span.remove(); });
    });
  });
})();
