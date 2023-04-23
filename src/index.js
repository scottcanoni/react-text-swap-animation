import React from 'react';
import ReactDOM from 'react-dom';
import TextSwap from './lib/components';
import './App.css';

ReactDOM.render(
    <React.StrictMode>
        <div>
            <h1>React Text Swap Animation</h1>
            <h2>Demo</h2>

            <TextSwap fontToObserve="Open Sans" />

            <br />
            <br />

            <TextSwap fontToObserve="Open Sans" words={['a witty saying', 'proves nothing']} />

            <br />
            <br />

            <TextSwap fontToObserve="Open Sans" words={['don\'t be sad it\'s over', 'be happy that it happened']} />

            <br />
            <br />

            <TextSwap fontToObserve="Open Sans" words={['debit card', 'bad credit']} />
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
                timingFunction: 'cubic-bezier(0.2,-2,0.8,2)'
            }} />
        </div>
    </React.StrictMode>,
    document.getElementById('root'),
);
