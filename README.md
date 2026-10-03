# QA Reference Guide

Offline-first, installable reference app for QA concepts. Searches a bundled knowledge base and
works with no network connection, on desktop and mobile.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 (JavaScript, no TypeScript) |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| PWA | `vite-plugin-pwa` + Workbox (`generateSW`) |
| Tests | Vitest 4 |
| Lint | oxlint |

## Quick start

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # run unit tests
npm run build      # regenerate icons + production build to dist/
npm run preview    # serve dist/ locally
```

## How offline works

The reference material lives in `src/data/reference.json` and is **imported into the JavaScript
bundle**, not fetched at runtime. There is no `fetch()` call in application code, so search works
with the network fully disabled.

A generated service worker precaches the app shell (HTML, JS, CSS, icons, manifest) on first load.
After the first visit the app is fully functional offline and installable.

`base: './'` in `vite.config.js` makes the build portable, so `dist/` can be served from any
subdirectory or opened behind any path.

## Updating the reference material

1. Edit `src/data/reference.json`. Each entry needs `question`, `answer`, and `keywords`.
2. Bump `REFERENCE_UPDATED` in `src/data/reference.js` (shown in the app footer).
3. Add sample questions to `SAMPLE_QUESTIONS` in the same file if you want them surfaced as chips.
4. `npm test` then `npm run build`.

There is a test asserting every entry has all three fields and that questions are unique, so
malformed entries fail the suite rather than shipping.

Matching is keyword-based scoring, not an LLM call: question-token hits score 3, answer hits 2,
keyword hits 3, any-entry token hit 1, and a full substring match of the question adds 5. Results
are ranked by score and the top result is shown, with up to three alternatives.

## Testing

```bash
npm test              # 17 tests
npm run test:watch    # watch mode
npm run coverage      # v8 coverage for src/lib
```

`src/lib/search.test.js` covers tokenizing, stop-word removal, ranking order, empty and
non-matching queries, malformed entries, and asserts every shipped sample question resolves to its
own entry.

Cross-platform checks worth doing before a release: verify install on iOS Safari (Share → Add to
Home Screen), Android Chrome (Install app), and desktop Chrome/Edge/Safari. The layout is
responsive from 320px up and honours `prefers-reduced-motion`.

## Regenerating icons

```bash
npm run icons
```

`scripts/generate-icons.js` renders `public/pwa-192.png`, `pwa-512.png`,
`pwa-maskable-512.png`, and `apple-touch-icon.png` from inline SVG via `@resvg/resvg-js`. It runs
automatically as part of `npm run build`. Edit the SVG in that script to change the mark.

## Release checklist

- [ ] `npm test` passes
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] `npm run preview`, then confirm search works
- [ ] DevTools → Application → Service Workers shows an activated worker
- [ ] DevTools → Network → Offline, reload, confirm search still answers
- [ ] Manifest shows no missing-icon warnings
- [ ] Confirm install prompt on one desktop and one mobile browser

## Maintenance notes

- **Dependencies:** `npm outdated` then update deliberately; Vite 8 requires Node 20.19+.
- **Service worker updates** use `registerType: 'autoUpdate'`, so a new deploy activates on the next
  load. Bump the cache by changing content, not by hand-editing `sw.js`.
- **`cleanupOutdatedCaches: true`** removes caches from previous Workbox versions.
- **Reference data** is version-controlled in `src/data/reference.json`; review changes to it as
  carefully as code, since it is the entire product surface.
- **Deploying:** `dist/` is fully static. Any static host works. Serve over HTTPS, otherwise
  service workers and install prompts are blocked by browsers.

## Project layout

```
src/
  App.jsx                 UI
  index.css               Tailwind entry + theme tokens
  main.jsx                React root + service worker registration
  data/
    reference.json        reference material (edit this)
    reference.js          typed accessors, updated date, sample questions
  lib/
    search.js             scoring and ranking (pure, unit tested)
    search.test.js        test suite
scripts/
  generate-icons.js       SVG to PNG icon generation
```