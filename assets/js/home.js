/* =====================================================================
   Home page — featured review preview (placeholder data)
   Real reviews can replace these once verified & submitted.
   ===================================================================== */
(function () {
  "use strict";

  // Placeholder featured reviews — clearly marked, replaced by real ones later.
  var featured = [
    {
      name: "Ananya",
      meta: "Patient · Bengaluru",
      rating: 5,
      body: "A calm, unhurried first visit where I truly felt heard. The treatment focused on the cause, not just quick relief.",
    },
    {
      name: "Rohit",
      meta: "Patient · Bengaluru",
      rating: 5,
      body: "Gentle remedies and genuinely personal care. The follow-ups made me feel supported through the whole journey.",
    },
    {
      name: "Meera",
      meta: "Patient · Bengaluru",
      rating: 5,
      body: "Thoughtful, patient and reassuring. A holistic approach that considered my lifestyle, not only my symptoms.",
    },
  ];

  function cardHTML(r, i) {
    var grad = window.HarmonyUI.avatarGradient(r.name);
    var initials = window.HarmonyUI.initials(r.name);
    return (
      '<article class="card review-card reveal" data-delay="' + i + '">' +
        '<span class="placeholder-tag">Sample review</span>' +
        '<div class="quote-mark">&ldquo;</div>' +
        '<div class="stars" aria-label="' + r.rating + ' out of 5 stars">' + window.HarmonyUI.stars(r.rating) + "</div>" +
        '<p class="body">' + r.body + "</p>" +
        '<div class="review-author">' +
          '<span class="avatar" style="background:' + grad + '">' + initials + "</span>" +
          '<span class="meta"><strong>' + r.name + "</strong><span>" + r.meta + "</span></span>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var wrap = document.getElementById("featuredReviews");
    if (!wrap) return;
    wrap.innerHTML = featured.map(cardHTML).join("");

    // Re-run reveal observation for the freshly injected cards.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      wrap.querySelectorAll(".reveal").forEach(function (el) {
        io.observe(el);
      });
    } else {
      wrap.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("in");
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
