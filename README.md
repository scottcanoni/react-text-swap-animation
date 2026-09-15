# React Text Swap Animation

**Animate between any two words or phrases in React — letters glide to their new positions, and the ones with nowhere to go fade away.**

![React Text Swap Animation demo: A WITTY SAYING morphing into PROVES NOTHING](https://raw.githubusercontent.com/scottcanoni/react-text-swap-animation/main/docs/demo.gif)

[![npm version](https://img.shields.io/npm/v/react-text-swap-animation.svg)](https://www.npmjs.com/package/react-text-swap-animation)
[![npm downloads](https://img.shields.io/npm/dm/react-text-swap-animation.svg)](https://www.npmjs.com/package/react-text-swap-animation)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-text-swap-animation)](https://bundlephobia.com/package/react-text-swap-animation)
[![CI](https://github.com/scottcanoni/react-text-swap-animation/actions/workflows/node.js.yml/badge.svg)](https://github.com/scottcanoni/react-text-swap-animation/actions/workflows/node.js.yml)
[![license](https://img.shields.io/npm/l/react-text-swap-animation.svg)](./LICENSE)

The two phrases do **not** have to be anagrams. Letters that exist in both simply move; letters with no counterpart travel to an empty slot and fade out, and new ones fade in on the way back.

- **Zero runtime dependencies**
- **TypeScript types included**
- **SSR / Next.js App Router safe** — no CSS import, no browser globals at module scope
- **Respects `prefers-reduced-motion`**
- **ESM and CommonJS**, React 17, 18 and 19

## Install

```bash
npm install react-text-swap-animation
```

## Quick start

```jsx
import TextSwap from 'react-text-swap-animation';

export default function Hero() {
    return <TextSwap words={['a witty saying', 'proves nothing']} />;
}
```

There is no stylesheet to import. Style it like any other text:

```css
.text-swap {
    font-family: 'Open Sans', sans-serif;
    font-size: 42px;
    font-weight: bold;
    color: #fff;
    text-transform: uppercase;
}
```

**[Live demo →](https://scottcanoni.github.io/react-text-swap-animation/)**

## Usage

Control the timing with `animationOptions`. Every value is in milliseconds.

```jsx
<TextSwap
    words={['Text Swap Animation', 'Antitoxin Swamp Tea']}
    animationOptions={{
        randomStartMin: 0,
        randomStartMax: 3000,
        randomReverseMin: 6000,
        randomReverseMax: 6000,
        loopAnimation: 20000,
        waitToStart: 5000,
        transitionDuration: 2000,
        timingFunction: 'ease-in-out',
    }}
/>
```

If the text uses a webfont, name it with `fontToObserve` so the letters are measured after the font loads rather than before:

```jsx
<TextSwap fontToObserve="Open Sans" />
```

`className` and `style` are merged with the component's own, and any other prop — `id`, `data-*`, `aria-*` — is forwarded to the root element.

## How the pairing works

This is the part that makes arbitrary phrases work, and it is worth understanding before you pick your words.

1. **Both phrases are padded with spaces** to the same length, so every letter has a slot to pair with.
2. **Each letter of the first phrase claims a destination**, left to right, taking the first unclaimed match it can find:
   - **the same character** — the letter simply travels there;
   - **failing that, a space** — the letter travels to the gap and **fades out**;
   - **failing that, any free slot** — the letter **morphs** into a different character at the midpoint of its journey.
3. On the way back the same rules run in reverse, so a letter that disappeared reappears.

The practical consequence: **the more letters the two phrases share, the better it looks.** Pairs that are close to anagrams read as a genuine rearrangement; wildly different phrases read more like a morph. Matching is case-insensitive, so `'Cat'` pairs happily with `'act'`.

> If both of your words are true anagrams, [`react-anagram-animation`](https://www.npmjs.com/package/react-anagram-animation) is smaller and every letter is guaranteed a real destination.

## API

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `words` | `[string, string]` | `['Text Swap Animation', 'Antitoxin Swamp Tea']` | The two words or phrases. They need not be anagrams, or even the same length. |
| `animationOptions` | `AnimationOptions` | see below | Timing. Any subset; the rest fall back to the defaults. |
| `fontToObserve` | `string` | — | Font family to wait for before measuring. Omit to render immediately. |

### AnimationOptions

All times are in milliseconds. The randomness is what produces the jumbled, staggered effect — set `min` equal to `max` to make every letter move in lockstep instead.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `randomStartMin` | `number` | `0` | Minimum wait before a letter starts moving. |
| `randomStartMax` | `number` | `3000` | Maximum wait before a letter starts moving. Should be `>= randomStartMin`. |
| `randomReverseMin` | `number` | `6000` | Minimum wait before a letter heads back. |
| `randomReverseMax` | `number` | `9000` | Maximum wait before a letter heads back. Should be `>= randomReverseMin`. |
| `loopAnimation` | `number` | `12000` | Wait before the next full cycle. Should be `>= randomReverseMax + transitionDuration`. |
| `waitToStart` | `number` | `0` | Wait before the very first run. |
| `transitionDuration` | `number` | `1000` | How long a letter takes to travel. A letter that changes character does so at the **halfway point**. |
| `timingFunction` | `string` | `'ease-in-out'` | Any CSS [timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function), including `cubic-bezier(...)`. |

### Named exports

```js
import TextSwap, { DEFAULT_ANIMATION_OPTIONS } from 'react-text-swap-animation';

DEFAULT_ANIMATION_OPTIONS.loopAnimation; // 12000
```

CommonJS consumers reach the component through `.default`:

```js
const TextSwap = require('react-text-swap-animation').default;
```

## Styling

The package ships **no CSS**. Only the structural rules that make measurement possible are applied inline; everything visual is yours. Target these class names:

| Class | Element |
| :--- | :--- |
| `.text-swap` | Root element. Set `font`, `color`, `text-transform` here. |
| `.text-swap-word` | Each of the three word layers. |
| `.text-swap-word-animation` | The visible, animating layer. |
| `.text-swap-letter` | Every individual letter. |

The three layers are stacked in a single CSS grid cell, so the component takes up the width and height of its longest phrase and will not overlap its neighbours. Constrain it with `max-width` and long phrases wrap and animate between lines.

## TypeScript

Types ship with the package; nothing extra to install.

```tsx
import TextSwap, { type AnimationOptions } from 'react-text-swap-animation';

const options: AnimationOptions = { transitionDuration: 2000 };

<TextSwap words={['a witty saying', 'proves nothing']} animationOptions={options} />;
```

`words` is typed as a two-element tuple, so a third phrase is a compile error. If you hoist the array, use `as const`.

## SSR and Next.js

Safe to import from a server component or any SSR context: it imports no CSS and touches no browser globals at module scope. On the server it renders the first phrase as real text, then measures and animates after hydration.

It is a client component, so in the Next.js App Router use it from a file with `'use client'`.

## Accessibility

- **`prefers-reduced-motion: reduce` is respected.** The phrase renders at rest and no timers are scheduled. There is no prop to override this — the animation is decorative.
- The two hidden measurement copies are `aria-hidden`, so a screen reader reads the phrase **once**.

## Migrating from v1

v2 removes the stylesheet that used to ship with the package. It forced `color: #fff`, `text-transform: uppercase` and `width: 100%` on every consumer, which made the component render invisibly on a light background.

**To restore the v1 appearance, add this to your own CSS:**

```css
.text-swap {
    color: #fff;
    text-transform: uppercase;
    text-align: left;
    width: 100%;
    margin: 0 auto;
    padding: 0;
}
```

Other breaking changes:

- **The animation now looks different, because v1 positioned letters wrongly.** It fed a viewport-relative coordinate into `left`, so any instance not flush against the left edge of the window was offset by its own inset and drifted with horizontal scroll. It also never set `top`, so wrapped phrases collapsed onto a single line.
- **Letters actually fade now.** `opacity` was missing from the transition list, so appearing and disappearing letters popped instantly.
- **A letter changes character at `transitionDuration / 2`**, not after a hardcoded 500ms.
- **The component now has a real width and height.** Every layer used to be absolutely positioned, so the element collapsed to zero height and overlapped whatever followed it.
- **Class names are namespaced.** `.word` → `.text-swap-word`, `.letter` → `.text-swap-letter`, and `.hidden` is gone. (`.hidden` collided with Tailwind's `.hidden { display: none }`.)
- **No more `import 'react-text-swap-animation/dist/components/index.css'`** — there is no CSS file.
- **Deep imports are gone.** Use the named exports.
- **`main` is now `dist/index.cjs`**, alongside a real ESM build at `dist/index.mjs`.
- **Browser floor is now ~Chrome 80 / Safari 13.1** (was ~Chrome 67), because `core-js` was dropped.
- **`prefers-reduced-motion` is respected**, so some users will see a static phrase.

See [CHANGELOG.md](./CHANGELOG.md) for the full list.

## Contributing

```bash
npm install
npm start        # demo at http://localhost:5173
npm test
npm run lint
npm run build    # builds the library into dist/
```

### Releasing

Merging to `main` never publishes. Only pushing a `v*` tag does, so docs,
dependency bumps and CI changes can land freely.

**1. Check what will actually ship.** From a *fresh clone*, so nothing
uncommitted or stale in your working directory can leak into the package:

```bash
git clone --depth 1 https://github.com/scottcanoni/react-text-swap-animation.git /tmp/verify
cd /tmp/verify && npm ci && npm run build && npm pack --dry-run
```

Expect 8 files: `LICENSE`, `README.md`, `package.json`, and five in `dist/`.

**2. Bump and tag.** `npm version` writes `package.json` and creates the tag in
one operation, so the two cannot drift apart:

```bash
npm version patch        # or minor / major
git push --follow-tags   # pushing the tag is what publishes
```

**3. Wait about two minutes.** `release.yml` checks the tag matches
`package.json`, then runs `npm publish` — which runs `prepublishOnly` first:
lint, typecheck, tests and build. If any of those fail, nothing is published.

**4. Verify.** `npm view` lies immediately after a publish: the registry
processes asynchronously and your local npm cache holds a stale packument. Ask
the registry directly instead:

```bash
curl -s https://registry.npmjs.org/react-text-swap-animation | grep -o '"latest":"[^"]*"'
```

For the same caching reason a local `npm install` of the new version may fail
with `ETARGET`; `npm install --prefer-online` fixes it. Neither affects anyone
else.

#### If a release goes wrong

Don't unpublish. Point `latest` back at the last good version and fix forward:

```bash
npm dist-tag add react-text-swap-animation@1.5.1 latest
```

Existing installs of the bad version are unaffected; new ones resolve to the
old version until you publish a fix.

#### One-time infrastructure

Already configured. Recorded here in case this repo is ever recreated:

- **npm Trusted Publishing** — npmjs.com → the package → *Settings* → *Trusted
  Publisher* → *GitHub Actions*, with repository `scottcanoni/react-text-swap-animation`, workflow
  filename `release.yml` (that exact string, not a path), no environment, and
  direct publishing allowed. This is what authenticates CI over OIDC: there is
  no npm token in this repository, nothing to rotate, and nothing to leak. It
  also produces the provenance attestation npm shows on the package page.
- **GitHub Pages** — repo *Settings* → *Pages* → *Source: GitHub Actions*.
  `pages.yml` builds the demo with Vite and deploys it on every push to `main`.
  Ignore the Jekyll and Static HTML starter cards; neither runs a build step.

### Keeping in sync with `react-anagram-animation`

These two packages are deliberately separate, but most of their code is the same
and it has drifted badly before. When you change one, check whether the other
needs the same change.

**Intentionally identical:** `useFonts.js`, `randomMinMax` in `utils.js`,
`eslint.config.js`, `tsconfig.json`, `vite.config.lib.js`, and the GitHub
workflows.

**Intentionally different — do not "fix" these to match:**

| | `react-anagram-animation` | `react-text-swap-animation` |
| :--- | :--- | :--- |
| Positioning | Relative **delta** (`dest − src`), letters in normal flow | **Absolute** coordinates, letters out of flow |
| Why | Letters never change character, so flow is safe, and deltas are immune to where the element sits | A letter changes character mid-flight; in flow that would reflow every letter after it |
| Hidden words | Offset off-screen with `left: -1000px` | **Not** offset — absolute coordinates need all layers to share an origin |
| Layout | Animation layer is in flow and gives the container its size | Single-cell CSS grid; the measurement words give the container its size |
| Timers per letter | 2 | 4 (two extra for the mid-flight character change) |

## License

WTFPL — see [LICENSE](./LICENSE).
