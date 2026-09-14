import useFonts from './useFonts';
import TextSwap from './TextSwap';
import { DEFAULT_ANIMATION_OPTIONS, DEFAULT_WORDS } from './constants';

/**
 * Render and animate from one word to another word and back again.
 * @param {[string, string]} [words] The 2 words or phrases to animate between.
 * @param {AnimationOptions} [animationOptions] Timing options for when to start, how fast to animate forwards, backwards, and when to loop.
 * @param {string} [fontToObserve] The name of an embedded font to wait for before measuring.
 * @returns {JSX.Element|null}
 */
export default function Loader({ words = DEFAULT_WORDS, animationOptions = {}, fontToObserve, ...rest }) {
    const isFontLoaded = useFonts(fontToObserve);

    // Pad to equal length so every letter has a slot to pair with. A letter
    // with no counterpart is therefore paired with a padding space, which is
    // what makes "disappear" and "appear" fall out of the same mechanism.
    const maxLength = Math.max(words[0].length, words[1].length);

    // Passed as two strings rather than an array: an array literal built here
    // would be a new reference on every render, and the child depends on it.
    return isFontLoaded ? (
        <TextSwap
            word1={words[0].padEnd(maxLength, ' ')}
            word2={words[1].padEnd(maxLength, ' ')}
            animationOptions={{
                ...DEFAULT_ANIMATION_OPTIONS,
                ...animationOptions,
            }}
            {...rest}
        />
    ) : null;
}
