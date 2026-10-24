# Jayden White — Portfolio

A hand-built portfolio for a Roblox Studio UI designer and Luau scripter.
Static HTML, CSS and vanilla JavaScript — no build step, no frameworks.

**Live site:** https://jaydenwhite7714.github.io/Portfolio/

## What's inside

- **Hero** with an interactive Roblox Studio window mock (Explorer, Properties, Output, and a working-looking HUD).
- **Selected work** — six project cards, each opening a detail modal with scope, stack and numbers.
- **UI Lab** — five live, interactive recreations of Roblox interfaces (Combat HUD, Shop, Inventory, Quest Log, Settings). They scale with container queries so they look right on phones.
- **Code samples** — tabbed Luau snippets with copy-to-clipboard.
- **Process, About and Contact**, plus scroll reveals, a cursor spotlight, magnetic buttons and a 3D tilt on the Studio mock.

## Structure

```
.
├── index.html
└── assets
    ├── css
    │   ├── core.css        # tokens, reset, nav, buttons, modal, footer
    │   ├── sections.css    # hero, studio mock, services, work, process, about, contact
    │   ├── uilab.css       # the interactive UI previews
    │   ├── code.css        # code panel and side notes
    │   └── responsive.css  # breakpoints
    ├── js
    │   └── main.js         # nav, reveals, tilt, tabs, modal, clipboard
    └── img
        └── favicon.svg
```

## Run locally

It's a static site, so anything that serves files works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy (GitHub Pages)

The site is plain static files, so it deploys straight from the repo root with no build step.

1. Open **Settings → Pages** for this repository.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Pick branch **`main`** and folder **`/ (root)`**, then **Save**.

About a minute later the site is live at:

**https://jaydenwhite7714.github.io/Portfolio/**

Every push to `main` republishes it automatically. `404.html` is picked up as the
custom not-found page, and `.nojekyll` stops Jekyll from touching the files.

## Making it yours

A few things are worth swapping for real values:

- **Discord handle** — `data-handle="jaydenwhite"` on the `#copyDiscord` button in `index.html`.
- **Stats** — the four numbers in the hero (`data-count="48"` etc.) and the copy under "Selected work".
- **Projects** — the six `.proj` cards in `index.html` plus the matching entries in the `projects` object near the bottom of `assets/js/main.js`.
- **UI Lab screens** — the markup lives under `#panel-*` in `index.html`; the captions are in the `labMeta` object in `assets/js/main.js`.
- **Code samples** — the three `<pre>` panels in `#code`.

## Accessibility & performance notes

- Keyboard operable: tabs support arrow keys, project cards open with Enter/Space, the modal traps focus and closes on Esc.
- Respects `prefers-reduced-motion` (animations, reveals and the cursor spotlight switch off).
- No external JS libraries. Only Google Fonts is loaded remotely; everything else ships with the repo.
