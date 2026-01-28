# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

Run locally with any HTTP server (required for YAML fetch):
```bash
python -m http.server 8080
```
Then open http://localhost:8080

## Architecture

CV Clicker is a gamified personal CV/resume website. Users click to earn points and progressively unlock CV sections.

### Core Game Loop (js/main.js → js/game.js)
- `Game` class manages all state and user interactions
- `gameLoop()` runs via requestAnimationFrame for auto-clicker ticks
- Click events on `#click-area` trigger point accumulation and unlock checks

### State Management (js/persistence.js)
- Game state stored in cookies with localStorage fallback
- Auto-saves every 30 seconds and on visibility change
- State includes: totalClicks, upgrades owned, unlocked sections, theme, language

### CV Content (js/cv-renderer.js + data/content_it.yaml)
- Bilingual CV data (English/Polish) parsed from YAML at runtime using js-yaml CDN
- Sections unlock at click thresholds: 10 (header), 50 (skills), 150 (experience), 400 (projects), 800 (education), 1500 (contact)
- `CVRenderer.renderSection()` generates HTML for each section type

### Store System (js/store.js)
- Upgrades: Auto-Clicker, Click Power, Double Clicks, Lucky Clicks, Momentum
- Themes: Neon, Retro, Minimal (one-time purchases, CSS file swaps)
- Cost formula: `baseCost * Math.pow(costMultiplier, owned)`

### Audio (js/audio.js)
- Web Audio API synthesized sounds (no audio files)
- Click, crit, purchase, and unlock sounds

### Theming (css/themes/)
- Themes override CSS custom properties defined in css/style.css
- Applied via dynamic stylesheet injection in `Store.applyTheme()`


### Coding standards
- Do not: Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
- Do not use emojis outside of index.hmtl