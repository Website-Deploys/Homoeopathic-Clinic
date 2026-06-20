/* =====================================================================
   Harmony Homoeopathic Clinic — Shared site behaviour
   - Loader, Lenis smooth scroll, GSAP/ScrollTrigger setup
   - Nav (scroll state + mobile toggle), reveal-on-scroll, counters
   - Background atmosphere: canvas particles + floating leaves
   ===================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const isCoarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  const isSmall = window.innerWidth < 1024;
  // Touch phones/tablets get a lightweight build (native scroll, no canvas/heavy float)
  const lite = isCoarse || isSmall;

  /* ---------- Loader ---------- */
  function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 800);
  }
  window.addEventListener("load", () => setTimeout(hideLoader, 550));
  // Safety: never let loader trap the page.
  setTimeout(hideLoader, 4000);

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  function initLenis() {
    if (prefersReduced || lite || typeof window.Lenis === "undefined") return;
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    }
    window.__lenis = lenis;
  }

  /* ---------- Anchor smooth scroll (works with or without Lenis) ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMobileNav();
        if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.2 });
        else target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- Navbar ---------- */
  const nav = document.getElementById("nav");
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }
  function closeMobileNav() { if (nav) nav.classList.remove("open"); }
  function initNav() {
    if (!nav) return;
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();
    const toggle = nav.querySelector(".nav-toggle");
    if (toggle) toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.decimals && parseInt(el.dataset.decimals)) || 0;
    const dur = 1800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = decimals ? target.toFixed(decimals) : Math.round(target).toLocaleString("en-IN");
    }
    requestAnimationFrame(tick);
  }
  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- GSAP parallax / floating ---------- */
  function initGSAP() {
    if (!hasGSAP || prefersReduced) return;
    const { gsap } = window;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    // Hero image parallax + chip float (desktop only — avoids mobile overlap)
    if (window.innerWidth >= 900) {
      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        if (!window.ScrollTrigger) return;
        gsap.to(el, {
          yPercent: -speed * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }

    // Gentle float for chips / leaves (desktop only — skip on touch/small for perf)
    if (!lite) {
      gsap.utils.toArray("[data-float]").forEach((el, i) => {
        gsap.to(el, {
          y: "+=14",
          rotation: el.classList.contains("leaf") ? "+=8" : 0,
          duration: 3 + (i % 3),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.25,
        });
      });
    }
  }

  /* ---------- Background atmosphere: particles + leaves ---------- */
  const LEAF_PATH =
    "M12 2C7 6 4 10 4 14c0 4 3 7 8 8 5-1 8-4 8-8 0-4-3-8-8-12zm0 4c2.5 2 4 4.5 4 8 0 .8-.1 1.5-.3 2.2C13.5 14 11 12.5 8.7 12 9.5 9.3 10.6 7.4 12 6z";

  function buildLeavesLayer() {
    const layer = document.getElementById("leaves");
    if (!layer) return;
    const count = lite ? 3 : 9;
    for (let i = 0; i < count; i++) {
      const leaf = document.createElement("div");
      leaf.className = "leaf";
      leaf.setAttribute("data-float", "");
      const size = 18 + Math.random() * 30;
      leaf.style.width = size + "px";
      leaf.style.height = size + "px";
      leaf.style.left = Math.random() * 100 + "%";
      leaf.style.top = Math.random() * 100 + "%";
      leaf.style.opacity = (0.18 + Math.random() * 0.3).toFixed(2);
      leaf.style.color = Math.random() > 0.5 ? "var(--green)" : "var(--green-light)";
      leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
      leaf.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="${LEAF_PATH}"/></svg>`;
      layer.appendChild(leaf);
    }
  }

  function initParticles() {
    const canvas = document.getElementById("particles");
    if (!canvas || prefersReduced || lite) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles, raf;
    const COLORS = ["rgba(123,191,106,", "rgba(201,169,110,", "rgba(167,215,161,"];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function make() {
      const count = Math.min(42, Math.floor((w * h) / 36000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.06,
        a: Math.random() * 0.32 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        const glow = (Math.sin(p.pulse) * 0.5 + 0.5) * p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + glow.toFixed(3) + ")";
        ctx.shadowColor = p.c + "0.8)";
        ctx.shadowBlur = 4;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }
    resize();
    make();
    draw();
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        cancelAnimationFrame(raf);
        resize();
        make();
        draw();
      }, 200);
    });
  }

  /* ---------- Light copy deterrents ----------
     Note: a public website's code is always downloadable by browsers; these
     only discourage casual copying and are not a security control. */
  function initProtect() {
    document.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    document.addEventListener("dragstart", function (e) { e.preventDefault(); });
    document.addEventListener("keydown", function (e) {
      var k = (e.key || "").toUpperCase();
      var ctrl = e.ctrlKey || e.metaKey;
      if (e.keyCode === 123) e.preventDefault();                         // F12
      if (ctrl && e.shiftKey && (k === "I" || k === "J" || k === "C")) e.preventDefault(); // devtools
      if (ctrl && (k === "U" || k === "S")) e.preventDefault();          // view-source / save
    });
    try {
      console.log(
        "%c© Harmony Homoeopathic Clinic",
        "color:#5BA24C;font-family:serif;font-size:16px;font-weight:700;"
      );
      console.log("%cContent is protected. Please do not copy.", "color:#243424;font-size:12px;");
    } catch (e) {}
  }

  /* ---------- Year stamp ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ---------- Boot ---------- */
  function boot() {
    initLenis();
    initNav();
    initAnchors();
    buildLeavesLayer();
    initParticles();
    initReveal();
    initCounters();
    initGSAP();
    initProtect();
    initYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // Expose small helpers for page scripts
  window.HarmonyUI = {
    avatarGradient(name) {
      const palettes = [
        ["#7BBF6A", "#5BA24C"],
        ["#C9A96E", "#a8854f"],
        ["#A7D7A1", "#7BBF6A"],
        ["#3A4F39", "#243424"],
        ["#8fbf7e", "#c9a96e"],
      ];
      let sum = 0;
      for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
      const p = palettes[sum % palettes.length];
      return `linear-gradient(135deg, ${p[0]}, ${p[1]})`;
    },
    initials(name) {
      return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0])
        .join("")
        .toUpperCase();
    },
    stars(n) {
      const full = "★".repeat(Math.round(n));
      const empty = "☆".repeat(5 - Math.round(n));
      return full + empty;
    },
  };
})();
