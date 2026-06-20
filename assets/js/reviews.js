/* =====================================================================
   Reviews & Patient Stories page
   - Overall rating circle + distribution bars
   - Masonry review gallery + category filters
   - Review submission: star input, drag & drop photo / before-after upload
   - Photo gallery (Pinterest-style) + lightbox
   - Video testimonial upload with instant preview
   NOTE: This is a static front end. Submitted reviews persist locally
   (localStorage) as a demo of the moderation flow; connect a backend
   to store & moderate real submissions across visitors.
   ===================================================================== */
(function () {
  "use strict";

  var UI = window.HarmonyUI;
  var STORAGE_KEY = "harmony_reviews_v1";

  /* ---------- Placeholder reviews (clearly sample until verified) ---------- */
  var sampleReviews = [
    { name: "Ananya", city: "Bengaluru", rating: 5, category: "Women's Health", date: "Recently", body: "A calm, unhurried first visit where I truly felt heard. The treatment focused on the root cause, not just quick relief.", sample: true },
    { name: "Rohit", city: "Bengaluru", rating: 5, category: "Allergies & Respiratory", date: "Recently", body: "Gentle remedies and genuinely personal care. My recurring sinus trouble has eased steadily over a few months.", sample: true },
    { name: "Meera", city: "Bengaluru", rating: 5, category: "Skin Conditions", date: "Recently", body: "Thoughtful and reassuring. A holistic approach that considered my lifestyle, not only my symptoms.", sample: true, photo: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=70" },
    { name: "Kavya", city: "Bengaluru", rating: 5, category: "Children's Health", date: "Recently", body: "My daughter's immunity has improved noticeably. Dr. Vaishali is patient with children and explains everything kindly.", sample: true },
    { name: "Arjun", city: "Bengaluru", rating: 4, category: "Digestive Disorders", date: "Recently", body: "Steady, sensible guidance for my long-standing acidity. I appreciated that there was no rush and no over-prescribing.", sample: true },
    { name: "Sahana", city: "Bengaluru", rating: 5, category: "Chronic / Lifestyle", date: "Recently", body: "The follow-ups made me feel supported through the whole journey. Sleep and stress have genuinely improved.", sample: true, photo: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=70" },
  ];

  /* ---------- Placeholder photo-story images (wellness / nature, not patients) ---------- */
  var samplePhotos = [
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=70",
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=70",
    "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=600&q=70",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=70",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=70",
    "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=600&q=70",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=70",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=70",
  ];

  var allReviews = [];
  var activeFilter = "All";

  function loadStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveStored(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* quota — ignore, keep in-session */
    }
  }

  /* ---------- Render review cards (masonry) ---------- */
  function reviewCardHTML(r) {
    var grad = UI.avatarGradient(r.name);
    var initials = UI.initials(r.name);
    var cat = r.category ? '<span class="cat-tag">' + r.category + "</span>" : "";
    var tag = r.sample ? '<span class="placeholder-tag">Sample review</span>' : "";
    var photo = r.photo
      ? '<div class="review-photo-thumb lb-src" data-full="' + r.photo + '"><img src="' + r.photo + '" alt="Patient submitted photo" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
      : "";
    return (
      '<article class="card review-card reveal">' +
        tag +
        cat +
        '<div class="stars" aria-label="' + r.rating + ' out of 5">' + UI.stars(r.rating) + "</div>" +
        '<p class="body">' + escapeHTML(r.body) + "</p>" +
        photo +
        '<div class="review-author">' +
          '<span class="avatar" style="background:' + grad + '">' + initials + "</span>" +
          '<span class="meta"><strong>' + escapeHTML(r.name) + "</strong><span>" + escapeHTML(r.city) + "</span></span>" +
        "</div>" +
        '<span class="date">' + (r.date || "Recently") + "</span>" +
      "</article>"
    );
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderMasonry() {
    var wrap = document.getElementById("reviewMasonry");
    if (!wrap) return;
    var list = activeFilter === "All" ? allReviews : allReviews.filter(function (r) { return r.category === activeFilter; });
    if (!list.length) {
      wrap.innerHTML = '<p class="text-muted center" style="grid-column:1/-1">No reviews in this category yet.</p>';
      return;
    }
    wrap.innerHTML = list.map(reviewCardHTML).join("");
    revealNow(wrap);
    bindLightboxSources();
  }

  function renderFilters() {
    var wrap = document.getElementById("reviewFilters");
    if (!wrap) return;
    var cats = ["All", "Allergies & Respiratory", "Skin Conditions", "Women's Health", "Children's Health", "Digestive Disorders", "Chronic / Lifestyle"];
    wrap.innerHTML = cats
      .map(function (c) {
        return '<button class="filter-chip' + (c === activeFilter ? " active" : "") + '" data-cat="' + c + '">' + c + "</button>";
      })
      .join("");
    wrap.querySelectorAll(".filter-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFilter = btn.dataset.cat;
        wrap.querySelectorAll(".filter-chip").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        renderMasonry();
      });
    });
  }

  /* ---------- Overall rating ---------- */
  function renderRating() {
    var count = allReviews.length;
    var avg = count ? allReviews.reduce(function (s, r) { return s + r.rating; }, 0) / count : 0;
    var rounded = Math.round(avg * 10) / 10;

    var valEl = document.getElementById("scoreVal");
    var countEl = document.getElementById("reviewCount");
    var starsEl = document.getElementById("overallStars");
    var prog = document.getElementById("scoreProg");
    if (countEl) countEl.textContent = count;
    if (starsEl) starsEl.textContent = UI.stars(avg);

    // distribution
    var dist = [0, 0, 0, 0, 0];
    allReviews.forEach(function (r) { dist[Math.round(r.rating) - 1]++; });
    var bars = document.getElementById("ratingBars");
    if (bars) {
      bars.innerHTML = [5, 4, 3, 2, 1]
        .map(function (star) {
          var pct = count ? Math.round((dist[star - 1] / count) * 100) : 0;
          return (
            '<div class="rating-bar"><span>' + star + " ★</span>" +
            '<span class="track"><span class="fill" data-pct="' + pct + '"></span></span>' +
            "<span>" + pct + "%</span></div>"
          );
        })
        .join("");
    }

    // Animate when visible
    var panel = document.getElementById("scoreCircle");
    var animated = false;
    function fillBars() {
      if (!bars) return;
      requestAnimationFrame(function () {
        bars.querySelectorAll(".fill").forEach(function (f) {
          f.style.width = (f.dataset.pct || 0) + "%";
        });
      });
    }
    function animate() {
      if (animated) return;
      animated = true;
      var circumference = 534; // 2*pi*85
      if (prog) prog.style.strokeDashoffset = circumference - (avg / 5) * circumference;
      // number count
      if (valEl) {
        var start = performance.now();
        (function tick(now) {
          var p = Math.min((now - start) / 1400, 1);
          valEl.textContent = (rounded * (1 - Math.pow(1 - p, 3))).toFixed(1);
          if (p < 1) requestAnimationFrame(tick);
          else valEl.textContent = rounded.toFixed(1);
        })(performance.now());
      }
      fillBars();
    }
    if ("IntersectionObserver" in window && panel) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animate(); io.disconnect(); }
        });
      }, { threshold: 0.3 });
      io.observe(panel);
    } else {
      animate();
    }
    // Safety net: never leave the bars empty even if the observer doesn't fire.
    setTimeout(animate, 1600);
  }

  /* ---------- Star input ---------- */
  var chosenRating = 0;
  function initStarInput() {
    var wrap = document.getElementById("starInput");
    if (!wrap) return;
    var stars = Array.prototype.slice.call(wrap.querySelectorAll("span"));
    function paint(n) { stars.forEach(function (s, i) { s.classList.toggle("on", i < n); }); }
    stars.forEach(function (s) {
      s.addEventListener("mouseenter", function () { paint(parseInt(s.dataset.v)); });
      s.addEventListener("click", function () {
        chosenRating = parseInt(s.dataset.v);
        paint(chosenRating);
        var hidden = document.getElementById("rvRating");
        if (hidden) hidden.value = chosenRating;
      });
    });
    wrap.addEventListener("mouseleave", function () { paint(chosenRating); });
  }

  /* ---------- Drag & drop upload ---------- */
  function initDropzone(dzId, inputId, previewId, store) {
    var dz = document.getElementById(dzId);
    var input = document.getElementById(inputId);
    var preview = document.getElementById(previewId);
    if (!dz || !input || !preview) return;

    function addFiles(files) {
      Array.prototype.slice.call(files).forEach(function (file) {
        if (!file.type.startsWith("image/")) return;
        if (store.length >= 5) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
          var item = { url: ev.target.result };
          store.push(item);
          var thumb = document.createElement("div");
          thumb.className = "dz-thumb";
          thumb.innerHTML = '<img src="' + ev.target.result + '" alt="preview"><button type="button" aria-label="Remove">&times;</button>';
          thumb.querySelector("button").addEventListener("click", function () {
            var idx = store.indexOf(item);
            if (idx > -1) store.splice(idx, 1);
            thumb.remove();
          });
          preview.appendChild(thumb);
        };
        reader.readAsDataURL(file);
      });
    }

    dz.addEventListener("click", function () { input.click(); });
    dz.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    input.addEventListener("change", function () { addFiles(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("drag"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("drag"); });
    });
    dz.addEventListener("drop", function (e) { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
  }

  /* ---------- Netlify Forms submission ---------- */
  function submitToNetlify(data) {
    try {
      var body = Object.keys(data)
        .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]); })
        .join("&");
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      }).catch(function () {/* offline / local preview — ignore */});
    } catch (e) {/* ignore */}
  }

  /* ---------- Form submit ---------- */
  var photoStore = [];
  var baStore = [];
  function initForm() {
    var form = document.getElementById("reviewForm");
    if (!form) return;
    var msg = document.getElementById("formMsg");

    initDropzone("dzPhotos", "filePhotos", "previewPhotos", photoStore);
    initDropzone("dzBA", "fileBA", "previewBA", baStore);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("rvName").value.trim();
      var city = document.getElementById("rvCity").value.trim();
      var text = document.getElementById("rvText").value.trim();
      var category = document.getElementById("rvCat").value || "";
      var consent = document.getElementById("rvConsent").checked;

      function fail(t) { msg.className = "form-msg err show"; msg.textContent = t; }

      if (!name || !city || !text) return fail("Please fill in your name, city and review.");
      if (!chosenRating) return fail("Please choose a star rating.");
      if (!consent) return fail("Please confirm your consent to publish the review.");

      var review = {
        name: name,
        city: city,
        rating: chosenRating,
        category: category,
        body: text,
        date: "Just now · pending review",
        sample: false,
        photo: photoStore.length ? photoStore[0].url : null,
      };

      // Deliver the submission to Netlify Forms (appears in the Netlify
      // dashboard — no email/backend needed). Fails silently offline.
      submitToNetlify({
        "form-name": "patient-review",
        name: name,
        city: city,
        rating: String(chosenRating),
        category: category,
        review: text,
        consent: "yes",
      });

      // Persist text-only copy (avoid storing large images in localStorage)
      var stored = loadStored();
      var lite = Object.assign({}, review, { photo: null, date: "Recently" });
      stored.unshift(lite);
      saveStored(stored);

      // Show immediately (with photo) in this session
      allReviews.unshift(review);
      activeFilter = "All";
      renderFilters();
      renderMasonry();
      renderRating();

      // Add any extra photos to the photo gallery this session
      photoStore.slice(1).concat(baStore).forEach(function (p) { addPhotoToGallery(p.url); });

      msg.className = "form-msg ok show";
      msg.textContent = "Thank you, " + name + "! Your review has been submitted and will appear after a quick moderation check.";
      form.reset();
      chosenRating = 0;
      document.querySelectorAll("#starInput span").forEach(function (s) { s.classList.remove("on"); });
      document.getElementById("previewPhotos").innerHTML = "";
      document.getElementById("previewBA").innerHTML = "";
      photoStore.length = 0;
      baStore.length = 0;

      if (window.__lenis) window.__lenis.scrollTo("#reviewMasonry", { offset: -90 });
      else document.getElementById("reviewMasonry").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- Photo gallery + lightbox ---------- */
  var galleryImages = [];
  function addPhotoToGallery(url, caption) {
    var grid = document.getElementById("photoGrid");
    if (!grid) return;
    var item = document.createElement("div");
    item.className = "ph-item reveal lb-src";
    item.dataset.full = url;
    item.innerHTML =
      '<img src="' + url + '" alt="' + (caption || "Patient story photo") + '" loading="lazy" onerror="this.parentNode.remove()">' +
      '<div class="ph-overlay">' + (caption || "Patient story") + "</div>";
    grid.appendChild(item);
    item.classList.add("in");
    item.addEventListener("click", function () { openLightbox(url); });
  }

  function renderPhotoGallery() {
    samplePhotos.forEach(function (u) { addPhotoToGallery(u, "Wellness moment"); });
    // include sample review photos
    allReviews.forEach(function (r) { if (r.photo) addPhotoToGallery(r.photo, "Patient story"); });
  }

  function bindLightboxSources() {
    document.querySelectorAll(".review-photo-thumb.lb-src").forEach(function (el) {
      if (el.__bound) return;
      el.__bound = true;
      el.addEventListener("click", function () { openLightbox(el.dataset.full); });
    });
  }

  function collectGallery() {
    galleryImages = Array.prototype.slice
      .call(document.querySelectorAll("#photoGrid .ph-item"))
      .map(function (el) { return el.dataset.full; });
  }
  var lbIndex = 0;
  function openLightbox(url) {
    collectGallery();
    var lb = document.getElementById("lightbox");
    var img = document.getElementById("lbImg");
    lbIndex = Math.max(0, galleryImages.indexOf(url));
    img.src = url;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
  }
  function navLightbox(dir) {
    if (!galleryImages.length) return;
    lbIndex = (lbIndex + dir + galleryImages.length) % galleryImages.length;
    document.getElementById("lbImg").src = galleryImages[lbIndex];
  }
  function initLightbox() {
    var lb = document.getElementById("lightbox");
    if (!lb) return;
    document.getElementById("lbClose").addEventListener("click", close);
    document.getElementById("lbPrev").addEventListener("click", function () { navLightbox(-1); });
    document.getElementById("lbNext").addEventListener("click", function () { navLightbox(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") navLightbox(-1);
      if (e.key === "ArrowRight") navLightbox(1);
    });
    function close() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); }
  }

  /* ---------- Video testimonial upload ---------- */
  function initVideo() {
    var card = document.getElementById("videoUploadCard");
    var input = document.getElementById("fileVideo");
    var grid = document.getElementById("videoGrid");
    if (!card || !input || !grid) return;
    card.addEventListener("click", function () { input.click(); });
    card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file || !file.type.startsWith("video/")) return;
      var url = URL.createObjectURL(file);
      var article = document.createElement("article");
      article.className = "card video-card reveal in";
      article.innerHTML =
        '<div class="vthumb"><video src="' + url + '" controls preload="metadata"></video></div>' +
        '<div class="vmeta"><h4>Your Video Testimonial</h4><span>Preview · pending moderation</span></div>';
      grid.insertBefore(article, card);
      article.querySelector("video").load();
    });
  }

  /* ---------- helpers ---------- */
  function revealNow(scope) {
    var els = (scope || document).querySelectorAll(".reveal:not(.in)");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.1 });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ---------- Boot ---------- */
  function boot() {
    var stored = loadStored();
    allReviews = stored.concat(sampleReviews);
    renderFilters();
    renderMasonry();
    renderRating();
    initStarInput();
    initForm();
    renderPhotoGallery();
    initLightbox();
    initVideo();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
