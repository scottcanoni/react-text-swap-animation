import type { ReactElement, HTMLAttributes } from 'react';

/**
 * Timing options for when to start, how fast to animate forwards and
 * backwards, and when to loop. All times are in milliseconds.
 */
export interface AnimationOptions {
    /** Minimum wait before a letter starts animating. Default `0`. */
    randomStartMin?: number;
    /** Maximum wait before a letter starts animating. Default `3000`. */
    randomStartMax?: number;
    /** Minimum wait before a letter animates back. Default `6000`. */
    randomReverseMin?: number;
    /** Maximum wait before a letter animates back. Default `9000`. */
    randomReverseMax?: number;
    /** Wait before the next full loop begins. Default `12000`. */
    loopAnimation?: number;
    /** Wait before the very first run. Default `0`. */
    waitToStart?: number;
    /**
     * How long a letter takes to reach its next position. A letter that
     * changes glyph does so at the halfway point. Default `1000`.
     */
    transitionDuration?: number;
    /** CSS timing function for the movement. Default `'ease-in-out'`. */
    timingFunction?: string;
}

export interface TextSwapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /**
     * The two words or phrases to animate between. They do NOT need to be
     * anagrams: the shorter one is padded with spaces, and any letter without
     * a counterpart travels to a space slot and fades out. Defaults to the
     * package's own name.
     */
    words?: readonly [string, string];
    animationOptions?: AnimationOptions;
    /**
     * Font family name to wait for via `document.fonts` before measuring.
     * Omit it to render immediately.
     */
    fontToObserve?: string;
}

/** The timing values used when `animationOptions` is omitted or partial. */
export declare const DEFAULT_ANIMATION_OPTIONS: Required<AnimationOptions>;

/**
 * Animate between any two words or phrases, letters gliding to their new
 * positions and unmatched letters fading in and out.
 *
 * Returns `null` only while waiting for `fontToObserve` to load.
 */
declare function TextSwap(props: TextSwapProps): ReactElement | null;

export default TextSwap;
