import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TextSwap from './lib/components';
import './App.css';

const root = createRoot(document.getElementById('root'));

root.render(
    // StrictMode double-invokes effects on purpose, so leaving it on here means
    // the demo immediately exposes any regression of the timer cleanup.
    <StrictMode>
        <div>
            <h1>React Text Swap Animation</h1>
            <h2>Demo</h2>

            <TextSwap fontToObserve="Open Sans" />

            <br />
            <br />

            <TextSwap fontToObserve="Open Sans" words={['a witty saying', 'proves nothing']} />

            <br />
            <br />

            {/* Wraps onto two lines, so it only animates correctly if `top` is set. */}
            <TextSwap
                className="narrow"
                fontToObserve="Open Sans"
                words={['don\'t be sad it\'s over', 'be happy that it happened']}
            />

            <br />
            <br />

            {/* Indented, so it only lines up if positions are container-relative. */}
            <TextSwap className="indented" fontToObserve="Open Sans" words={['debit card', 'bad credit']} />

            <br />
            <br />

            <TextSwap fontToObserve="Open Sans" words={['debit card', 'bad credit']} animationOptions={{
                randomStartMin: 0,
                randomStartMax: 3000,
                randomReverseMin: 12000,
                randomReverseMax: 12000,
                loopAnimation: 20000,
                waitToStart: 0,
                transitionDuration: 4000,
                timingFunction: 'cubic-bezier(0.2,-2,0.8,2)',
            }} />
        </div>
    </StrictMode>,
);
