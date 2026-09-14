# Changelog

## 2.0.0

A correctness and packaging release. The component worked in the author's demo and was broken or unusable almost everywhere else: it doubled its own animation under React StrictMode, threw on import in any SSR context, rendered invisible white text by default, positioned letters using the wrong coordinate space, and never animated the fade that is its whole reason to exist.

### Breaking

1. **Letters are positioned correctly now, so the animation looks different.** v1 assigned `getBoundingClientRect().x` — a *viewport*-relative coordinate — to the `left` of an absolutely positioned element whose containing block was the component itself. Any instance not flush against the left edge of the window rendered its letters offset by its own inset, and everything drifted when the page scrolled horizontally. It now uses `offsetLeft`/`offsetTop`, which are already relative to the right box.
2. **Vertical movement works.** `top` was never assigned, even though the transition string listed it and `offsetTop` was measured and then thrown away. Wrapped phrases collapsed onto a single line. They now animate between lines.
3. **The component has a real width and height.** All three layers were absolutely positioned, so the element collapsed to zero height and overlapped whatever came after it. The layers are now stacked in a single CSS grid cell sized by the longer phrase.
4. **Appearing and disappearing letters actually fade.** `opacity` was set but was not in the transition list, so they popped instantly.
5. **A letter changes character at `transitionDuration / 2`** instead of a hardcoded 500ms. With the documented `transitionDuration: 4000`, letters used to change identity 3.5 seconds before arriving.
6. **The stylesheet is gone.** The package ships and imports no CSS. The cosmetics it used to force on every consumer — `color: #fff`, `text-transform: uppercase`, `width/height: 100%` — are yours to set. See *Migrating from v1* in the README for a copy-paste block.
7. **Class names are namespaced.** `.word` → `.text-swap-word`, `.letter` → `.text-swap-letter`, `.word-animation` → `.text-swap-word-animation`. `.hidden` is gone; it collided with Tailwind's `.hidden { display: none }`, which would have silently zeroed every measurement.
8. **Deep imports no longer resolve**, and **`main` moved** from `dist/index.js` to `dist/index.cjs`.
9. **Browser floor raised** from roughly Chrome 67 / Safari 11.1 to Chrome 80 / Firefox 74 / Safari 13.1 / Edge 80.
10. **`prefers-reduced-motion: reduce` is now respected**, with no opt-out.
11. **`engines` now requires Node >= 18.**

### Fixed

- **Animation no longer doubles under React 18/19 StrictMode.** The effect installed a self-recursive `setTimeout` chain with no cleanup, so StrictMode's double invocation left two permanently out-of-phase loops. The repo's own demo is wrapped in StrictMode, so this was visible in development the whole time.
- **The animation loop no longer outlives the component**, and changing props no longer stacks another loop on top. This package schedules four timers per letter per cycle, so the leak accumulated twice as fast as its sibling's.
- **The component no longer restarts on every single render.** `Loader` built a fresh `words` array literal on each render and the child depended on it, so the effect tore down and restarted unconditionally — and consumer memoisation could not help. The child now takes two string props.
- **Passing a longer phrase no longer crashes.** Per-letter refs were created once at mount, so a later, longer `words` threw `Cannot read properties of undefined (reading 'current')`.
- **Works under SSR and React Server Components.** The built output used to `require('./index.css')` from CommonJS, which throws in Node. It now renders the first phrase as real text on the server.
- **Letters no longer pop in a frame late.** Measurement moved to `useLayoutEffect`.
- **Positions are re-measured on resize**, orientation change, or a late webfont swap.
- **A consumer `className` no longer replaces the component's own**, which used to break every documented styling hook. `className` is merged and `style` is combined with the structural styles.
- **`fontToObserve` fixes:** the hook re-ran its effect on every render; omitting the prop called `document.fonts.load('16px "undefined"')`; a rejected font load left the component rendering `null` forever with no explanation.
- **Unpairable input no longer throws** and take down the consumer's React tree; it logs once and renders the first phrase.
- **Screen readers read the phrase once**, not three times.
- Two comments that described the opposite of what the code did, and a `findIndex` parameter named `srcIndex` that was actually a destination index.

### Added

- **TypeScript types**, hand-written and shipped in the package.
- **ESM build** (`dist/index.mjs`) alongside CommonJS, with an `exports` map, `sideEffects: false` and sourcemaps.
- **`DEFAULT_ANIMATION_OPTIONS`** is now exported from the entry point.
- **Rest props are forwarded** to the root element.
- **A test suite** of 19 tests. Every fix in this release was mutation-tested: each one was individually reverted and a test caught it.
- **CI that actually enforces things** — lint, typecheck, test and build on Node 20, 22 and 24. Previously CI ran only `npm run build`, and the linter had never run.
- **A LICENSE file.** `package.json` declared WTFPL but no license text was published.
- **A permanent hosted demo** on GitHub Pages, replacing a hand-maintained CodeSandbox link.
- **npm provenance** on publish.
- **A "keeping in sync" section** in the README documenting which files are meant to match `react-anagram-animation` and which are deliberately different.

### Removed

- **`core-js`** — the only runtime dependency, and unnecessary. **The package now has zero runtime dependencies.**
- **Babel**, `sass`, `cross-env` and `rimraf` from the toolchain. The library is built by Vite.
- A fake `uuidv4` that was used only for React keys.
- Dead `rect` measurements that were captured and never read, and dead files in the published tarball.

## 1.5.1 and earlier

See the [commit history](https://github.com/scottcanoni/react-text-swap-animation/commits/main).
