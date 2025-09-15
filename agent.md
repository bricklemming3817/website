overview

this is a simple, static personal site meant for github pages. it presents a short bio and a small "my explorations" list (homepage section), plus individual project detail pages. the site is intentionally minimal, accessible, and intentionally lowercase as an aesthetic choice.

goals

- minimal ui, readable typography, responsive layout
- good a11y (focus states, aria live region, color contrast)
- no build step; pure html + css + tiny js
- subtle dark mode via `prefers-color-scheme`
- fun, non-destructive easter egg edit mode

structure

- `website/index.html` — homepage with bio and project links
- `website/projects/note-widget.html` — project detail
- `website/projects/resume-generator.html` — project detail
- `website/style.css` — design system, layout, components
- `website/script.js` — hidden edit mode logic
- `website/README.md` — brief repo intro
- `website/agent.md` — this file; guidance for ai agents

runtime behavior

- click-to-copy email: clicking `email` copies a fixed address to clipboard with a fallback; shows a brief confirmation by changing link text and announces via aria live region. link navigation is suppressed while editing is enabled.
- hidden edit mode (easter egg): first click on any non-interactive text turns the entire page editable (`contenteditable`). in edit mode, link navigation is blocked to prevent losing edits. press `esc` to exit. refresh resets all edits—no persistence.
- lowercase aesthetic: all text is rendered in lowercase via a global css rule (`body { text-transform: lowercase; }`). document titles and visible tooltips are also lowercase.
- dark mode: colors adapt automatically via css variables overridden under `@media (prefers-color-scheme: dark)`.
- bottom overscroll reveal: at page bottom, attempting to scroll beyond the end (desktop wheel) or overscroll on mobile reveals a centered secret message and instantly hides the site content (no animation). scrolling back up restores the original page. desktop fallback: `↓`/space at bottom reveals; `↑`/page up/shift+space restores. secret message: “after all is said and done, what humans really crave is simply to love and be loved”.

design system (in `style.css`)

- palette: slate-like neutrals, `--accent` indigo; mirrored for dark mode
- radius: `--radius: 12px`
- shadows: `--shadow-1`, `--shadow-2` for subtle elevation
- typography: fluid headings via `clamp`, improved line-height and rendering
- components: contact pills, responsive project cards, readable project pages

key files and responsibilities

- `website/style.css`
  - root css variables for palette, radii, shadows
  - global typography, selection, focus outlines
  - header, contacts, projects grid, cards, footer
  - `.visually-hidden` utility for screen-reader-only text
  - global lowercase transform on `body`
- `website/index.html`
  - bio + contacts (email copy link, github, 𝕏)
  - "my explorations" list linking to detail pages
  - includes a neutral placeholder card: “new project under construction” with no link and no details
  - inline email copy script: safe clipboard api + execcommand fallback; announces status in `#copy-status`
  - loads `script.js` (deferred) for edit mode
- `website/projects/*.html`
  - simple content sections: purpose, why, approach, outcome, reflection
  - each loads `../script.js` for edit mode
- `website/script.js`
  - toggles `contenteditable` on first click on non-interactive text
  - sets `data-edit-mode="on"` on `body` while active
  - disables link navigation during edit mode; `esc` exits

how to run locally

- open `website/index.html` directly in a browser, or
- from repo root run: `python3 -m http.server` and visit `http://localhost:8000/website/`

deployment

- works on github pages without any build tooling (static assets only)
- if using pages for the repo root, ensure the `website/` path is correct, or move files to the repo root depending on your pages configuration

editing and extending

- add a new project
  - create `website/projects/new-project.html` (copy a template from existing project files)
  - add a list item card in `website/index.html` under the projects `<ul>` with a link and short description
- tweak styling
  - change theme by adjusting css variables in `:root` and dark mode block
  - adjust grid via `grid-template-columns` in `.projects ul`
  - modify elevation via `--shadow-*`
- change accent color
  - update `--accent` in `:root` and dark mode
- clipboard behavior
  - email is defined once on the `#copy-email` link via the `data-email` attribute
  - inline script inside `index.html` handles copying; respect edit mode by early-returning when `data-edit-mode="on"`

accessibility notes

- focus-visible outlines and adequate color contrast are provided
- link pills are buttons semantically as anchors; they remain keyboard-accessible
- live region `#copy-status` politely announces copy success/failure
- lowercase rendering should not affect screen reader comprehension

constraints and trade-offs

- no build step: keep to html/css/js; avoid frameworks and heavy dependencies
- edit mode blocks navigation to avoid accidental page changes; this is intentional for the easter egg
- lowercase is visual via css; document titles/tooltips are manually set to lowercase for consistency

known todos / ideas

- optional: add a visible toast on copy, timed and non-intrusive
- optional: manual light/dark theme toggle (in addition to prefers-color-scheme)
- optional: per-page or selective edit mode scoping (e.g., exclude footer)
- optional: analytics-free pageview counter badge or last updated date

quick references

- homepage: `website/index.html`
- styles: `website/style.css`
- scripts: `website/script.js`
- project pages: `website/projects/`

coding style

- keep diffs minimal and focused
- prefer semantic html and progressive enhancement
- keep accessible names and roles intact; avoid breaking keyboard navigation
- follow current css variable scheme and component structure

maintenance

- keep this document current. whenever you add features, change structure, adjust behaviors, or modify deployment, promptly update `website/agent.md` so future ai coding agents have full context.
- record non-obvious decisions with a one-line rationale and relevant file paths.
- when adding/removing pages, scripts, or global css rules, update the "structure" and "runtime behavior" sections accordingly.
- optionally add a brief entry to the changelog below with date and a one-line summary.

changelog

- 2025-09-15 — added maintenance guidance; site uses lowercase aesthetic and hidden edit mode.
