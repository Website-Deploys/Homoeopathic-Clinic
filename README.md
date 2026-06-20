# Harmony Homoeopathic Clinic — Website

A premium, two-page marketing website for **Harmony Homoeopathic Clinic** (Dr. Vaishali S. Popale, BHMS — Kasturi Nagar, Bengaluru). Designed to feel like a luxury wellness brand: calm, natural, and trustworthy.

## Pages

1. **Home** (`index.html`) — luxury hero with a single primary CTA, animated trust bar, doctor profile + timeline, services, "Why Homoeopathy", success-snapshot statistics, a featured-reviews preview, and a contact section with an embedded map.
2. **Reviews & Patient Stories** (`reviews.html`) — overall rating circle, filterable masonry review gallery, a full review-submission module (star rating, drag-and-drop photo & before/after upload, consent), a Pinterest-style photo gallery with lightbox, and a video-testimonial upload with instant preview.

## Tech & approach

- **Hand-crafted HTML + CSS + vanilla JS** — no build step required. Open the files directly or serve the folder statically.
- **Custom design system** in `assets/css/styles.css` (palette, Playfair Display + Inter typography, glassmorphism, soft shadows, premium components).
- **Animation libraries via CDN** (loaded in the visitor's browser): [GSAP](https://gsap.com/) + ScrollTrigger and [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll. The site degrades gracefully if a library or image fails to load, and respects `prefers-reduced-motion`.
- **Nature atmosphere:** animated organic blobs, floating leaves, and a lightweight glowing-particle canvas — kept subtle on purpose.
- **SEO:** meta titles/descriptions, Open Graph/Twitter tags, and JSON-LD schema (`MedicalClinic` / `LocalBusiness` / `Physician`).

## Run locally

```bash
# from the project root
python3 -m http.server 8080
# then open http://localhost:8080
```

## Notes for the clinic owner

- **Testimonials are placeholders** (clearly tagged as *“Sample review”*) until real, verified patient reviews are provided.
- **Phone & email are placeholders** — share the real details and they can be updated in `index.html` (contact section) and the schema blocks.
- The review/photo/video uploads work on the front end and store text reviews in the browser (`localStorage`) as a demo of the moderation flow. To collect and moderate submissions from real visitors, connect a small backend or form service (the form is structured and ready for it).
- The contact map is a keyless Google Maps embed centered on Kasturi Nagar; replace the query with the exact clinic address when available.

## Structure

```
.
├── index.html            # Home
├── reviews.html          # Reviews & Patient Stories
└── assets/
    ├── css/styles.css     # Full design system
    └── js/
        ├── main.js        # Shared: loader, Lenis, nav, atmosphere, reveal, counters
        ├── home.js        # Home featured reviews
        └── reviews.js     # Rating, gallery, upload, lightbox, video
```
