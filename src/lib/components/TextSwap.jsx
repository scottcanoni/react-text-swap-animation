import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { randomMinMax, uuidv4 } from '../utils';

/**
 * Render and animate from one word to another word and back again.
 *
 * @param {[{string}]} words The 2 words to animate between.
 * @param {AnimationOptions} animationOptions Timing options for when to start, how fast forward/backwards, and when to loop.
 * @returns {JSX.Element}
 */
export default function TextSwap({ words, animationOptions }) {
    const [swapAnimations, setAnimations] = useState([]);
    const lettersRefs1 = useRef([...words[0]].map(() => createRef()));
    const lettersRefs2 = useRef([...words[1]].map(() => createRef()));
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
    } = animationOptions;

    useEffect(() => {
        const swaps = [];
        const destLettersPairedByIndex = [];

        [...words[0]].forEach((letter, i) => {
            // Find a matching destination character to execute the swap with
            let destLetterIndex = [...words[1]].findIndex((destLetter, srcIndex) => {
                return destLetter.toLowerCase() === letter.toLowerCase()
                        && destLettersPairedByIndex[srcIndex] !== true;
            });

            // If no matching character
            if (destLetterIndex === -1) {
                // Find a space to swap with
                destLetterIndex = [...words[1]].findIndex((destLetter, srcIndex) => {
                    return destLetter === ' ' && destLettersPairedByIndex[srcIndex] !== true;
                });

                // If there was no space, find first non-used space
                if (destLetterIndex === -1) {
                    destLetterIndex = [...words[1]].findIndex((destLetter, srcIndex) => {
                        return destLettersPairedByIndex[srcIndex] !== true;
                    });
                }
            }

            if (destLetterIndex === -1) {
                throw new Error(`Not sure how to animate since all source letters were paired already, disappear maybe?`);
            }

            destLettersPairedByIndex[destLetterIndex] = true; // mark this source paired/used

            // If the text wraps then the offset left isn't correct.
            const swap = {
                id: uuidv4(), // for a unique key
                letter, // the displayed letter
                playing: false, // if this letter is animating to the destination
                disappear: false, // if this letter should disappear (temporarily)
                // the source location, starting place and letter
                src: {
                    letter: words[0][i],
                    element: lettersRefs1.current[i].current,
                    offsetLeft: lettersRefs1.current[i].current.offsetLeft,
                    offsetTop: lettersRefs1.current[i].current.offsetTop,
                    rect: lettersRefs1.current[i].current.getBoundingClientRect(),
                },
                // the destination location and letter
                dest: {
                    letter: words[1][destLetterIndex],
                    element: lettersRefs2.current[destLetterIndex].current,
                    offsetLeft: lettersRefs2.current[destLetterIndex].current.offsetLeft,
                    offsetTop: lettersRefs2.current[destLetterIndex].current.offsetTop,
                    rect: lettersRefs2.current[destLetterIndex].current.getBoundingClientRect(),
                },
            };
            swaps.push(swap);
        });

        setAnimations(swaps);

        const animateFunc = () => {
            swaps.forEach((swap, i) => {
                // Animate each character towards the destination
                const forwardStartTime = randomMinMax(randomStartMin, randomStartMax);
                setTimeout(() => {
                    updateAnimation(i, { playing: true, disappear: false });
                    if (swap.src.letter !== ' ' && swap.dest.letter === ' ') {
                        updateAnimation(i, { disappear: true });
                    }
                }, forwardStartTime);

                // Half way towards the destination, switch to the destination letter
                setTimeout(() => {
                    if (swap.src.letter !== ' ' && swap.dest.letter === ' ') {
                        // do nothing
                    }
                    else {
                        updateAnimation(i, { letter: swap.dest.letter });
                    }
                }, forwardStartTime + 500);


                // Animate each character back to their original location
                const reverseStartTime = randomMinMax(randomReverseMin, randomReverseMax);
                setTimeout(() => {
                    updateAnimation(i, { playing: false, disappear: false });
                    if (swap.dest.letter !== ' ' && swap.src.letter === ' ') {
                        updateAnimation(i, { disappear: true });
                    }
                }, reverseStartTime);

                // Half way back to the initial location, switch to the initial letter
                setTimeout(() => {
                    if (swap.dest.letter !== ' ' && swap.src.letter === ' ') {
                        // do nothing
                    }
                    else {
                        updateAnimation(i, { letter: swap.src.letter });
                    }
                }, reverseStartTime + 500);
            });

            // Repeat forever
            setTimeout(() => {
                animateFunc();
            }, loopAnimation);
        };

        // Start the process
        setTimeout(() => {
            animateFunc();
        }, waitToStart);

    }, [lettersRefs1, lettersRefs2, loopAnimation, updateAnimation, randomReverseMax, randomReverseMin, randomStartMax, randomStartMin, waitToStart, words]);

    return (
            <div className="text-swap">
                <div className="word word-1 hidden">
                    {
                        [...words[0]].map((letter, i) => {
                            // eslint-disable-next-line react/no-array-index-key
                            return <span ref={lettersRefs1.current[i]} className="letter" key={`${i}${letter}`}>{letter}</span>;
                        })
                    }
                </div>
                <div className="word word-2 hidden">
                    {
                        [...words[1]].map((letter, i) => {
                            // eslint-disable-next-line react/no-array-index-key
                            return <span ref={lettersRefs2.current[i]} className="letter" key={`${i}${letter}`}>{letter}</span>;
                        })
                    }
                </div>
                <div className="word word-animation">
                    {
                        swapAnimations.map((renderedLetter, i) => {
                            const { id, letter, playing, disappear, src, dest } = renderedLetter;

                            let letterStyles = {};
                            if (playing) {
                                const left = `${dest.rect.x}px`;
                                letterStyles = { left };
                            }
                            else {
                                const left = `${src.rect.x}px`;
                                letterStyles = { left };
                            }

                            if (disappear) {
                                letterStyles.opacity = 0;
                            }

                            return (
                                    <span key={id} className="letter" style={letterStyles}>
                                {letter}
                            </span>
                            );
                        })
                    }
                </div>
            </div>
    );
}
