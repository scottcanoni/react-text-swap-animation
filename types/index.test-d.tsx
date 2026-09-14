/*
 * Compile-time guard for the hand-written index.d.ts. This file is never
 * shipped and never run; `npm run typecheck` failing is the whole point.
 */
import TextSwap, { DEFAULT_ANIMATION_OPTIONS, type AnimationOptions } from '../src/lib';

const options: AnimationOptions = { waitToStart: 0, timingFunction: 'ease-in-out' };
const loopDefault: number = DEFAULT_ANIMATION_OPTIONS.loopAnimation;

export const usage = (
    <>
        <TextSwap />
        <TextSwap words={['a witty saying', 'proves nothing']} animationOptions={options} />
        <TextSwap fontToObserve="Open Sans" className="hero" id="x" data-testid="y" />

        {/* @ts-expect-error three words is not a valid pair */}
        <TextSwap words={['a', 'b', 'c']} />

        {/* @ts-expect-error timings are numbers, not strings */}
        <TextSwap animationOptions={{ waitToStart: '500' }} />

        {/* @ts-expect-error unknown props are still rejected */}
        <TextSwap notARealProp={1} />
    </>
);

export { loopDefault };
