import { StrictMode } from 'react';
import { act, render, cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import TextSwap from './index';

/*
 * jsdom does no layout: offsetLeft/offsetTop are hardcoded to 0, so every
 * letter would sit at the same coordinate and the moved state would be
 * indistinguishable from the resting state. Stubbing the offsets with a
 * letter's index within its own word gives a deterministic fake layout, which
 * makes the positioning, the state machine and the fade all observable.
 *
 * These are still not real pixels. That the letters land in the right place on
 * screen is verified in a browser, not here.
 */
const COLUMN_WIDTH = 10;
const descriptors = {};

beforeAll(() => {
    descriptors.offsetLeft = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetLeft');
    descriptors.offsetTop = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop');

    Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
        configurable: true,
        get() {
            return [...(this.parentElement?.children ?? [])].indexOf(this) * COLUMN_WIDTH;
        },
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetTop', { configurable: true, get: () => 0 });
});

afterAll(() => {
    for (const [name, descriptor] of Object.entries(descriptors)) {
        if (descriptor) {
            Object.defineProperty(HTMLElement.prototype, name, descriptor);
        }
        else {
            delete HTMLElement.prototype[name];
        }
    }
});

// Same length, every letter pairs by tier 1, so nothing appears or disappears.
const EVEN = ['bad credit', 'debit card'];
// Different lengths: 'cat' is padded to 'cat  ', so two letters must appear
// and disappear rather than move.
const UNEVEN = ['cat', 'mouse'];

// min === max everywhere so the RNG cannot make these flake.
const DETERMINISTIC = {
    waitToStart: 100,
    randomStartMin: 1000,
    randomStartMax: 1000,
    randomReverseMin: 9000,
    randomReverseMax: 9000,
    loopAnimation: 20000,
    transitionDuration: 4000,
    timingFunction: 'linear',
};

const animatedLetters = (container) => [
    ...container.querySelectorAll('.text-swap-word-animation .text-swap-letter'),
];
const lefts = (container) => animatedLetters(container).map((el) => el.style.left);
const glyphs = (container) => animatedLetters(container).map((el) => el.textContent).join('');

// Timer callbacks call setState, so they have to run inside act() for React to
// flush the re-render before the assertions look at the DOM.
const advance = (ms) => act(() => {
    vi.advanceTimersByTime(ms);
});

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    // restoreAllMocks does not undo stubGlobal, and without this the
    // reduced-motion test's matchMedia stub leaks into every test after it.
    vi.unstubAllGlobals();
});

describe('<TextSwap>', () => {
    it('renders every letter of the first word in the animation layer', () => {
        const { container } = render(<TextSwap words={EVEN} animationOptions={DETERMINISTIC} />);

        expect(glyphs(container)).toBe(EVEN[0]);
    });

    it('pads the shorter word so both layers have the same letter count', () => {
        const { container } = render(<TextSwap words={UNEVEN} animationOptions={DETERMINISTIC} />);

        expect(animatedLetters(container)).toHaveLength(UNEVEN[1].length);
        expect(glyphs(container)).toBe('cat  ');
    });

    it('clears every timer on unmount so the loop cannot outlive the component', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { unmount } = render(<TextSwap words={EVEN} animationOptions={DETERMINISTIC} />);

        expect(vi.getTimerCount()).toBeGreaterThan(0);

        unmount();
        expect(vi.getTimerCount()).toBe(0);

        advance(120_000);
        expect(vi.getTimerCount()).toBe(0);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('runs a single animation loop under StrictMode, not two out of phase', () => {
        render(
            <StrictMode>
                <TextSwap words={EVEN} animationOptions={DETERMINISTIC} />
            </StrictMode>,
        );

        // Four timers per letter (out, glyph swap, back, glyph swap) plus one
        // for the next loop. Double invocation would double this.
        advance(DETERMINISTIC.waitToStart + 1);
        expect(vi.getTimerCount()).toBe(EVEN[0].length * 4 + 1);
    });

    it('positions letters at their own offsets, not at viewport coordinates', () => {
        const { container } = render(<TextSwap words={EVEN} animationOptions={DETERMINISTIC} />);

        // At rest every letter sits at its own index in word 1.
        expect(lefts(container)).toEqual(
            EVEN[0].split('').map((_, i) => `${i * COLUMN_WIDTH}px`),
        );

        advance(DETERMINISTIC.waitToStart + DETERMINISTIC.randomStartMin + 1);

        // 'b' is index 0 of "bad credit" and index 2 of "debit card".
        expect(animatedLetters(container)[0].style.left).toBe(`${2 * COLUMN_WIDTH}px`);
    });

    it('sets top as well as left, so wrapped phrases can move between lines', () => {
        const { container } = render(<TextSwap words={EVEN} animationOptions={DETERMINISTIC} />);

        // top was never assigned before, which collapsed multi-line phrases.
        expect(animatedLetters(container).every((el) => el.style.top !== '')).toBe(true);
    });

    it('transitions opacity, or the fade this package exists for just pops', () => {
        const { container } = render(<TextSwap words={UNEVEN} animationOptions={DETERMINISTIC} />);

        expect(animatedLetters(container)[0].style.transition).toContain('opacity');
    });

    it('fades out a letter that has nowhere to go', () => {
        const { container } = render(<TextSwap words={['mouse', 'cat']} animationOptions={DETERMINISTIC} />);

        expect(animatedLetters(container).every((el) => el.style.opacity === '')).toBe(true);

        advance(DETERMINISTIC.waitToStart + DETERMINISTIC.randomStartMin + 1);

        // 'mouse' -> 'cat  ': two letters are paired with padding spaces.
        expect(animatedLetters(container).filter((el) => el.style.opacity === '0')).toHaveLength(2);
    });

    it('changes a letter at the midpoint of its journey, not after a fixed 500ms', () => {
        // UNEVEN, not EVEN: in an anagram pair every letter swaps for itself,
        // so the glyph change would be invisible.
        const { container } = render(<TextSwap words={UNEVEN} animationOptions={DETERMINISTIC} />);
        const start = DETERMINISTIC.waitToStart + DETERMINISTIC.randomStartMin;
        const midpoint = DETERMINISTIC.transitionDuration / 2; // 2000, not 500

        // Well past the old hardcoded 500ms, and still the original glyphs.
        advance(start + 600);
        expect(glyphs(container)).toBe('cat  ');

        advance(midpoint - 600 + 1);
        expect(glyphs(container)).toBe('mouse');
    });

    it('renders at rest and schedules nothing when reduced motion is preferred', () => {
        vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

        const { container } = render(<TextSwap words={EVEN} animationOptions={DETERMINISTIC} />);
        const atRest = lefts(container);

        expect(vi.getTimerCount()).toBe(0);

        advance(120_000);
        expect(lefts(container)).toEqual(atRest);
        expect(glyphs(container)).toBe(EVEN[0]);
    });

    it('survives an environment with no ResizeObserver', () => {
        const original = globalThis.ResizeObserver;
        delete globalThis.ResizeObserver;

        try {
            expect(() => render(<TextSwap words={EVEN} animationOptions={DETERMINISTIC} />)).not.toThrow();
        }
        finally {
            globalThis.ResizeObserver = original;
        }
    });

    it('re-measures on resize without disturbing the playing state', () => {
        let trigger = () => {};
        const observed = [];
        vi.stubGlobal('ResizeObserver', class {
            constructor(callback) {
                trigger = callback;
            }

            observe(element) {
                observed.push(element);
            }

            disconnect() {}
        });

        const { container } = render(<TextSwap words={EVEN} animationOptions={DETERMINISTIC} />);

        advance(DETERMINISTIC.waitToStart + DETERMINISTIC.randomStartMin + 1);
        const before = lefts(container);

        // Stubbed only now: React's own scheduler uses rAF during render, and
        // a synchronous stub in place for that would break the initial mount.
        vi.stubGlobal('requestAnimationFrame', (cb) => {
            cb();

            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', () => {});

        act(() => {
            trigger();
        });

        expect(observed).toEqual([container.querySelector('.text-swap')]);
        expect(lefts(container)).toEqual(before);
    });

    it('merges a consumer className instead of replacing its own', () => {
        const { container } = render(
            <TextSwap words={EVEN} animationOptions={DETERMINISTIC} className="hero" style={{ color: 'red' }} />,
        );
        const root = container.querySelector('.text-swap');

        // A bare {...rest} spread after className would have wiped out
        // .text-swap and broken every documented styling hook.
        expect(root).not.toBeNull();
        expect(root.className).toBe('text-swap hero');
        expect(root.style.position).toBe('relative');
        expect(root.style.color).toBe('red');
    });

    it('forwards unknown props to the root element', () => {
        const { container } = render(
            <TextSwap words={EVEN} animationOptions={DETERMINISTIC} id="hero" data-testid="swap" />,
        );
        const root = container.querySelector('.text-swap');

        expect(root.id).toBe('hero');
        expect(root.getAttribute('data-testid')).toBe('swap');
    });

    it('hides the two measurement words from assistive technology', () => {
        const { container } = render(<TextSwap words={EVEN} animationOptions={DETERMINISTIC} />);

        expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
        expect(container.querySelector('.text-swap-word-animation').getAttribute('aria-hidden')).toBeNull();
    });
});
