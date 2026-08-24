# TMV-Home-page-mobile

ASP.NET Core (Razor Pages, .NET 8) home page for TM Ventures, reproducing
the Figma "fan carousel" hero for both breakpoints:

- **Mobile** (<900px, "TM Ventures Home_Mobile"): 3 cards in a tight fan.
- **Desktop** (>=900px, "flow 7"): 5 cards in a wider scattered arc, plus
  a compact bottom-left control cluster instead of a full-width bar.

Both share one rotation engine and a play button that starts/stops the
cards auto-rotating on their own (it's not an audio player).

## Run

```bash
dotnet restore
dotnet run
```

Then open the URL printed in the console (e.g. `https://localhost:5001`).
Resize the browser (or use its device toolbar) across ~900px to see it
switch between the mobile and desktop layouts.

## Project layout

```
Program.cs                     ASP.NET Core startup (Razor Pages)
Pages/Index.cshtml(.cs)        Home page markup + mobile/desktop slide data
Pages/Shared/_Layout.cshtml    Shared HTML shell, fonts, script include
wwwroot/css/site.css           All styling + carousel/player animations
wwwroot/js/carousel.js         Shared carousel engine, swipe, auto-play logic
wwwroot/images/                Where to drop real exported photos (see README there)
```

## How the animation works

Both breakpoints render at once (`<main class="phone-frame">` and
`<main class="desktop-hero">` are both always in the DOM); `site.css`
shows exactly one of them via a `@media (min-width: 900px)` query, so
switching is instant with no JS re-render.

- **Fan carousel** (`.fan-card` elements): each card gets a role class —
  `left`/`center`/`right` on mobile, `outer-left`/`inner-left`/`center`/
  `inner-right`/`outer-right` on desktop — and every role has its own
  fixed `transform` (position, rotation, scale) in CSS. `carousel.js`'s
  `createFanCarousel()` factory relabels which card holds which role;
  because only the class changes, the browser animates the transform on
  its own (650ms, `cubic-bezier` back-ease), with no re-render.
- **Rotation direction**: "next" walks every card one role toward the
  left — the current center card lands in the role just left of center
  (matching the Figma flow) — and "prev" mirrors it. The engine is
  generic over the role list, so the exact same function drives the
  3-role mobile ring and the 5-role desktop ring.
- Arrow buttons are disabled for the duration of a transition so rapid
  clicking can't desync the animation. Clicking any off-center card, a
  swipe, or ← / → also rotates.
- The track title/artist cross-fades to match whichever slide is now
  centered.
- **Play button**: toggles *auto-rotation*, not audio — it starts a
  timer (`AUTO_PLAY_MS`, 3.2s) that calls the same rotation the next
  arrow uses, so the deck advances on its own. It also cross-fades the
  play/pause SVG icons, pulses the button, and animates the "now
  playing" indicator above the carousel (an equalizer pill on mobile, a
  text badge on desktop, matching each Figma reference) while running.
  Any manual interaction stops auto-play so it doesn't fight the user.
- `prefers-reduced-motion: reduce` shortens/disables the animations for
  users who request it.

Swap the CSS-gradient placeholders in `site.css` for the real Figma
exports — see `wwwroot/images/README.md`.
