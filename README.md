# TMV-Home-page-mobile

ASP.NET Core (Razor Pages, .NET 8) mobile home page for TM Ventures,
reproducing the Figma "fan carousel" hero: three images arranged in a
fan layout that rotate via the left/right arrow buttons, plus a
play/pause control for the featured track.

## Run

```bash
dotnet restore
dotnet run
```

Then open the URL printed in the console (e.g. `https://localhost:5001`).
The layout is mobile-first (max-width ~430px, centered), so use your
browser's device toolbar / a phone to preview it as intended.

## Project layout

```
Program.cs                     ASP.NET Core startup (Razor Pages)
Pages/Index.cshtml(.cs)        Home page markup + slide data
Pages/Shared/_Layout.cshtml    Shared HTML shell, fonts, script include
wwwroot/css/site.css           All styling + carousel/player animations
wwwroot/js/carousel.js         Carousel rotation, swipe, play/pause logic
wwwroot/images/                Where to drop real exported photos (see README there)
```

## How the animation works

- **Fan carousel** (`.fan-card` elements in `#fanStage`): three cards are
  assigned a `left` / `center` / `right` role class, each with its own
  `transform` (position, rotation, scale). Clicking the arrows (or
  swiping, or clicking a side card, or pressing ← / →) rotates which
  card holds which role in `carousel.js`; because only the CSS class
  changes, the browser animates the transform smoothly (650ms,
  `cubic-bezier` back-ease) with no re-render or layout thrash.
- Buttons are disabled for the duration of the transition so rapid
  clicking can't desync the animation.
- The track title/artist in the player bar cross-fades to match
  whichever slide is now centered.
- **Play button**: toggles a `.is-playing` class that cross-fades the
  play/pause SVG icons, pulses the button, and animates the small
  "now playing" equalizer pill above the carousel. It's wired to an
  `<audio>` element — set `audio.src` (or add a `data-src` attribute on
  each slide and assign it in `updateMeta`) once you have real track
  files; without a source it still animates the UI state.
- `prefers-reduced-motion: reduce` shortens/disables the animations for
  users who request it.

Swap the CSS-gradient placeholders in `site.css` for the real Figma
exports — see `wwwroot/images/README.md`.
