/*
 * Index-based keys are correct in this file: within a given word pair the
 * letter arrays are fixed length and never reordered, so the index is the
 * stable identity. The letter is appended only to keep keys readable.
 */
/* eslint-disable react/no-array-index-key */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { randomMinMax } from '../utils';

/**
 * The only styles this component cannot live without. Everything cosmetic
 * (color, font, size, casing) is deliberately left to the consumer's own CSS,
 * which can target the `text-swap-*` class names with no specificity fight.
 */
const STYLES = {
    // A single-cell grid stacks all three layers on top of each other. It is
    // what gives the component a real width and height: the animated letters
    // are absolutely positioned and contribute no size of their own, so
    // without the measurement words sharing their cell the whole element
    // would collapse to zero height and overlap whatever sits next to it.
    // It also means all three layers share one origin, which is what makes
    // the offsets below directly comparable.
    root: { position: 'relative', display: 'grid' },
    word: { position: 'relative', gridArea: '1 / 1' },
    // `visibility: hidden` and NOT `display: none`: the measurement words must
    // still participate in layout or offsetLeft/offsetTop return 0 and the
    // whole animation collapses.
    //
    // Deliberately NOT offset off-screen, unlike react-anagram-animation. That
    // package animates by a relative delta and so is immune to where the
    // measured words sit; this one positions letters absolutely, which needs
    // the measurement words to share an origin with the animation layer.
    hidden: { visibility: 'hidden' },
    letter: { whiteSpace: 'pre', display: 'inline-block', zIndex: 10 },
    // The animated letters are absolutely positioned rather than in flow,
    // because a letter changes glyph mid-flight and an in-flow span would
    // reflow every letter after it when 'i' became 'W'.
    animatedLetter: { whiteSpace: 'pre', display: 'inline-block', position: 'absolute', zIndex: 10 },
};

// Measuring must happen before paint, or the letters visibly pop in a frame
// late. Falling back to useEffect on the server avoids React's "useLayoutEffect
// does nothing on the server" warning in every SSR consumer's logs.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * The `typeof window.matchMedia === 'function'` check is not optional: jsdom
 * has no matchMedia, so omitting it breaks every consumer's test suite.
 */
function prefersReducedMotion() {
    return typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const isSpace = (character) => character === ' ';

/**
 * Render and animate from one word to another word and back again.
 *
 * @param {string} word1 The word to animate from, already padded to word2's length.
 * @param {string} word2 The word to animate to.
 * @param {AnimationOptions} animationOptions Timing options for when to start, how fast forward/backwards, and when to loop.
 * @returns {JSX.Element}
 */
export default function TextSwap({ word1, word2, animationOptions, className, style, ...rest }) {
    const [swapAnimations, setAnimations] = useState([]);
    const [isDegraded, setIsDegraded] = useState(false);
    const rootRef = useRef(null);
    const word1Ref = useRef(null);
    const word2Ref = useRef(null);
    const updateAnimation = useCallback((i, update = {}) => {
        setAnimations((prevState) => {
            const newState = [
                ...prevState,
            ];
            newState[i] = {
                ...prevState[i],
                ...update,
            };

            return newState;
        });
    }, [setAnimations]);

    const {
        randomStartMin,
        randomStartMax,
        randomReverseMin,
        randomReverseMax,
        loopAnimation,
        waitToStart,
        transitionDuration,
        timingFunction,
    } = animationOptions;

    useIsomorphicLayoutEffect(() => {
        /**
         * Pair every source letter with an unused destination letter, in three
         * tiers, and record where each end sits:
         *
         * 1. the same character, so the letter simply moves;
         * 2. failing that, a space, so the letter travels there and fades out;
         * 3. failing that, any free slot, so the letter morphs into another.
         *
         * The words are padded to equal length before they reach here, so a
         * complete pairing always exists and tier 3 cannot run out. Returning
         * null is defence for this component being used directly with
         * unequal-length words.
         */
        const buildSwaps = () => {
            const srcElements = word1Ref.current.children;
            const destElements = word2Ref.current.children;
            const destChars = [...word2];
            const destPaired = [];
            const swaps = [];
            const isFree = (destIndex) => destPaired[destIndex] !== true;

            for (const [i, letter] of [...word1].entries()) {
                let destLetterIndex = destChars.findIndex((destLetter, destIndex) => {
                    return destLetter.toLowerCase() === letter.toLowerCase() && isFree(destIndex);
                });

                if (destLetterIndex === -1) {
                    destLetterIndex = destChars.findIndex((destLetter, destIndex) => {
                        return isSpace(destLetter) && isFree(destIndex);
                    });
                }

                if (destLetterIndex === -1) {
                    destLetterIndex = destChars.findIndex((destLetter, destIndex) => isFree(destIndex));
                }

                if (destLetterIndex === -1) {
                    return null;
                }

                destPaired[destLetterIndex] = true; // mark this destination used

                const srcElement = srcElements[i];
                const destElement = destElements[destLetterIndex];

                swaps.push({
                    letter, // the currently displayed glyph
                    playing: false, // is this letter animating towards the destination
                    disappear: false, // should this letter currently be faded out
                    destIndex: destLetterIndex, // needed to re-measure on resize
                    src: {
                        letter,
                        offsetLeft: srcElement.offsetLeft,
                        offsetTop: srcElement.offsetTop,
                    },
                    dest: {
                        letter: destChars[destLetterIndex],
                        offsetLeft: destElement.offsetLeft,
                        offsetTop: destElement.offsetTop,
                    },
                });
            }

            return swaps;
        };

        const swaps = buildSwaps();

        if (swaps === null) {
            console.error(
                '[react-text-swap-animation] Cannot animate because there were more '
                + `letters in "${word1}" than slots in "${word2}". Rendering the first `
                + 'word without animation.',
            );
            setIsDegraded(true);

            return undefined;
        }

        setIsDegraded(false);
        setAnimations(swaps);

        // Purely decorative motion, so honour the OS setting unconditionally
        // and leave the letters at rest.
        if (prefersReducedMotion()) {
            return undefined;
        }

        let cancelled = false;
        const timers = new Set();
        // Every timer is registered so it can be cancelled, and self-prunes on
        // fire so the set stays bounded despite the endless loop.
        const later = (fn, ms) => {
            const id = setTimeout(() => {
                timers.delete(id);

                if (!cancelled) {
                    fn();
                }
            }, ms);
            timers.add(id);
        };

        // Change the glyph at the midpoint of the journey. This used to be a
        // hardcoded 500ms, which swapped the letter long before it arrived
        // whenever transitionDuration was larger.
        const midpoint = transitionDuration / 2;

        const animateFunc = () => {
            swaps.forEach((swap, i) => {
                const vanishesOnTheWayOut = !isSpace(swap.src.letter) && isSpace(swap.dest.letter);
                const vanishesOnTheWayBack = !isSpace(swap.dest.letter) && isSpace(swap.src.letter);

                // Out to the destination.
                const forwardStartTime = randomMinMax(randomStartMin, randomStartMax);
                later(() => {
                    updateAnimation(i, { playing: true, disappear: vanishesOnTheWayOut });
                }, forwardStartTime);

                // Halfway there, become the destination glyph. A letter on its
                // way out keeps its own glyph, invisibly, ready for the return.
                if (!vanishesOnTheWayOut) {
                    later(() => updateAnimation(i, { letter: swap.dest.letter }), forwardStartTime + midpoint);
                }

                // ...and back again. Appearing and disappearing are the same
                // mechanism run in opposite directions.
                const reverseStartTime = randomMinMax(randomReverseMin, randomReverseMax);
                later(() => {
                    updateAnimation(i, { playing: false, disappear: vanishesOnTheWayBack });
                }, reverseStartTime);

                if (!vanishesOnTheWayBack) {
                    later(() => updateAnimation(i, { letter: swap.src.letter }), reverseStartTime + midpoint);
                }
            });

            // Repeat forever. Registering the recursion is what makes it
            // cancellable.
            later(animateFunc, loopAnimation);
        };

        // Start the process
        later(animateFunc, waitToStart);

        // Offsets are captured once, so a viewport resize, an orientation
        // change or a late webfont swap would leave every letter flying to a
        // stale coordinate. Re-measure in place, preserving playing/disappear
        // so a transition already in flight simply retargets.
        const remeasure = () => {
            const srcElements = word1Ref.current.children;
            const destElements = word2Ref.current.children;

            setAnimations((previous) => previous.map((swap, i) => ({
                ...swap,
                src: {
                    ...swap.src,
                    offsetLeft: srcElements[i].offsetLeft,
                    offsetTop: srcElements[i].offsetTop,
                },
                dest: {
                    ...swap.dest,
                    offsetLeft: destElements[swap.destIndex].offsetLeft,
                    offsetTop: destElements[swap.destIndex].offsetTop,
                },
            })));
        };

        let frame = 0;
        // jsdom has no ResizeObserver, so this must stay optional.
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(remeasure);
        });

        observer?.observe(rootRef.current);

        // Without this the loop outlived unmount, and React 18/19 StrictMode
        // double-invocation left two permanently out-of-phase animations.
        return () => {
            cancelled = true;
            timers.forEach(clearTimeout);
            timers.clear();
            observer?.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [word1, word2, updateAnimation, loopAnimation, randomReverseMax, randomReverseMin, randomStartMax, randomStartMin, waitToStart, transitionDuration]);

    return (
        <div
            className={className ? `text-swap ${className}` : 'text-swap'}
            style={{ ...STYLES.root, ...style }}
            ref={rootRef}
            {...rest}
        >
            <div className="text-swap-word text-swap-word-1" style={{ ...STYLES.word, ...STYLES.hidden }} aria-hidden="true" ref={word1Ref}>
                {
                    [...word1].map((letter, i) => {
                        return <span className="text-swap-letter" style={STYLES.letter} key={`${i}-${letter}`}>{letter}</span>;
                    })
                }
            </div>
            <div className="text-swap-word text-swap-word-2" style={{ ...STYLES.word, ...STYLES.hidden }} aria-hidden="true" ref={word2Ref}>
                {
                    [...word2].map((letter, i) => {
                        return <span className="text-swap-letter" style={STYLES.letter} key={`${i}-${letter}`}>{letter}</span>;
                    })
                }
            </div>
            <div className="text-swap-word text-swap-word-animation" style={STYLES.word}>
                {
                    isDegraded
                        ? <span className="text-swap-letter" style={STYLES.letter}>{word1}</span>
                        : swapAnimations.map((renderedLetter, i) => {
                            const { letter, playing, disappear, src, dest } = renderedLetter;
                            // offsetLeft/offsetTop, not getBoundingClientRect().x.
                            // The rect is viewport-relative, but these are set on an
                            // absolutely positioned child of .text-swap, so the old
                            // code shifted every instance by its own left inset and
                            // moved with horizontal page scroll. top was never set
                            // at all, which collapsed wrapped phrases onto one line.
                            const { offsetLeft, offsetTop } = playing ? dest : src;

                            const letterStyles = {
                                ...STYLES.animatedLetter,
                                // opacity has to be in the transition list, or the
                                // fade this package exists for simply pops.
                                transition: `left ${transitionDuration}ms ${timingFunction}, top ${transitionDuration}ms ${timingFunction}, opacity ${transitionDuration}ms ${timingFunction}`,
                                left: `${offsetLeft}px`,
                                top: `${offsetTop}px`,
                            };

                            if (disappear) {
                                letterStyles.opacity = 0;
                            }

                            return (
                                <span key={`${i}-${letter}`} className="text-swap-letter" style={letterStyles}>
                                    {letter}
                                </span>
                            );
                        })
                }
            </div>
        </div>
    );
}
