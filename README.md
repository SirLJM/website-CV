# CV Clicker

Interactive CV/resume website disguised as a clicker game. Click to earn points and progressively unlock CV sections.

## Demo

Open `index.html` via any HTTP server:

```bash
python -m http.server 8080
```

Then visit http://localhost:8080

## Features

- **Click mechanics** - Earn points with visual feedback (floating numbers, ripples, particles)
- **Progressive unlocks** - CV sections reveal at click thresholds (10, 50, 150, 400, 800, 1500)
- **Store system** - Purchase upgrades (Auto-Clicker, Click Power, Double Clicks, Lucky Clicks, Momentum)
- **Themes** - Three purchasable visual themes (Neon Glow, Retro 8-bit, Minimal Pro)
- **Bilingual** - English/Polish language toggle
- **Sound effects** - Web Audio API synthesized sounds with mute option
- **Persistence** - Progress saved to cookies/localStorage

## CV Sections

| Clicks | Unlock |
|--------|--------|
| 10 | Header (name, photo, intro) |
| 50 | Skills |
| 150 | Work Experience |
| 400 | Projects |
| 800 | Education & Certifications |
| 1500 | Contact & Languages |

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- js-yaml (CDN) for parsing CV content
- Web Audio API for sound effects
- CSS custom properties for theming
