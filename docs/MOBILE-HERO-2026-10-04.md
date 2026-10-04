# Mobile hero refinement — 4 October 2026

- Retained the complete 16:9 salon film on phones, with an inset cinema frame and quiet location caption.
- Moved mobile controls beneath the footage; added an accessible seek slider, elapsed/duration display, playback indicator, and explicit playback-error feedback.
- Added iOS native fullscreen fallback when available; retained desktop fullscreen and existing pause-on-scroll/reduced-motion behavior.
- Refined mobile heading hierarchy, brass brand symbol entrance, service/bridal action cards and discover control. No continuous decorative animation.
- French/Arabic visual checks at 390px; 320px narrow layout and 1440px desktop checked for overflow and composition. Play/pause and keyboard seek verified in the browser. Viewport override reset afterward.
- Corrected an observed metadata/hydration timing issue that initially left duration at zero after playback started.
- npm test, typecheck and production build passed. The scope does not change pricing, reviews or database schema.
