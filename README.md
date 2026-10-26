# Personal Portfolio Website — Ushant Giri

A distinctive, Apple-inspired personal portfolio website engineered to showcase my background, technical competencies, engineering philosophy, and projects as a software developer and tech enthusiast.

## 📸 Preview
![Portfolio Preview](assets/image/webpage.png)

---

## ✨ Features & Architecture

- **Apple-Inspired Design System**: Designed around Apple WWDC design principles with refined typography, optical tracking, proportional leading, and translucent materials (`backdrop-filter`).
- **Dynamic Dual Theme**: Smooth, persistent Light and Dark modes with automatic OS system preference detection and manual toggle.
- **Fluid Micro-Interactions**: Critically damped spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`), immediate pointer-down feedback (`:active { transform: scale(0.97); }`), and an animated sliding pill navigation indicator.
- **Deep Linking**: Hash-based URL state management (`#about`, `#resume`, `#portfolio`, `#contact`) allowing instant deep linking and smooth page transitions.
- **Editorial Bento Grid**: Modern visual storytelling highlighting learning philosophy, algorithmic problem-solving approach, and career vision.
- **Interactive Copy-to-Clipboard**: Quick one-click email and phone number copy with instant visual confirmation.
- **Responsive & Accessible**: Fully adaptive across mobile, tablet, and desktop viewports, with first-class support for `prefers-reduced-motion` and `prefers-reduced-transparency`.
- **Zero Heavy Dependencies**: Clean vanilla architecture without bulky frameworks or external CDN font/icon dependencies that could break or lag.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic, accessible document structure (`<aside>`, `<nav>`, `<article>`, `<section>`, ARIA attributes).
- **CSS3 Modern Layouts**: CSS Custom Properties, Grid, Flexbox, glassmorphic backdrop filters, and media queries.
- **JavaScript (ES6+)**: Responsive event handling, sliding navigation indicator physics, dynamic category filtering, theme persistence, and clipboard API.
- **Vector Graphics**: Inline SVGs for instantaneous rendering without external network latency.

---

## 📂 Project Structure

```bash
UShantgiri/
├── index.html              # Main application entry point & semantic markup
├── assets/
│   ├── css/
│   │   └── sty.css         # Apple-inspired design system tokens & responsive layouts
│   ├── js/
│   │   └── rep.js          # Interactive sliding tabs, theme controller & copy utilities
│   └── image/
│       ├── mypp.png        # Profile portrait
│       ├── project web.png # Portfolio template project screenshot
│       ├── Screenshot...   # Student database management system screenshot
│       └── webpage.png     # Full-page preview
└── README.md               # Project documentation
```

---

## 🚀 Local Development & Preview

Because the site is built with pure web standards (HTML5/CSS3/JavaScript), no build step is required:

1. Clone or navigate into the repository:
   ```bash
   git clone https://github.com/code-with-ushant/UShantgiri.git
   cd UShantgiri
   ```

2. Open `index.html` in your browser, or start a local HTTP server:
   ```bash
   python -m http.server 8080
   ```
   Then open `http://localhost:8080`.

---

## 🌐 Deployment

This portfolio is static and 100% compatible with **GitHub Pages**:
1. Push your commits to the `main` branch.
2. In GitHub repository settings, under **Pages**, set **Source** to `Deploy from a branch` and branch to `main` / `root`.
3. Your site is live at `https://code-with-ushant.github.io/UShantgiri/`.
