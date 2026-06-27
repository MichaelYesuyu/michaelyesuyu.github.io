# suyuye.com

Personal website of **Suyu (Michael) Ye** — incoming CS Ph.D. at Johns Hopkins University.

A hand-built static site (no framework, no build step) served by GitHub Pages at
[suyuye.com](https://suyuye.com).

## Structure

```
index.html              # the whole single-page site
404.html                # not-found page
assets/css/main.css     # design system, light/dark themes, responsive layout
assets/js/main.js       # theme toggle, scrollspy, mobile nav, BibTeX modal, reveal
assets/img/photo/       # profile photo + paper thumbnails
assets/icons/           # favicons / PWA icons
CNAME                   # custom domain (suyuye.com)
.nojekyll               # serve files as-is (skip Jekyll processing)
```

## Editing

Everything is plain HTML/CSS/JS — edit `index.html` directly.

- **Add a publication:** copy a `<li class="pub card reveal">…</li>` block in the
  `#research` section, update the text, thumbnail (`assets/img/photo/`), links, and the
  `<script type="application/x-bibtex">` block (its `id` must match the Cite button's
  `data-cite`).
- **Add news:** add a `<li class="news__item reveal">` in the `#news` section.
- **Theme colors:** edit the CSS variables at the top of `assets/css/main.css`
  (`:root` for light, `[data-theme="dark"]` for dark).
- **CV:** drop a PDF at `assets/Suyu_Ye_CV.pdf` (the CV buttons already point there).

## Local preview

```bash
python -m http.server 8000
# then open http://localhost:8000
```
