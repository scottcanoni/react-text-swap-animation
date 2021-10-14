import React from 'react';
import ReactDOM from 'react-dom';
import TextSwap from './lib/components';
import './App.css';

ReactDOM.render(
    <React.StrictMode>
        <div>
            <h1>React Text Swap Animation</h1>
            <h2>Demo</h2>

            <TextSwap fontToObserve={{ family: 'Open Sans' }} />

            <br/>
            <br/>

            <TextSwap fontToObserve={{ family: 'Open Sans' }} words={["a witty saying", "proves nothing"]}  />

            <br/>
            <br/>

            <TextSwap fontToObserve={{ family: 'Open Sans' }} words={["don't be sad it's over", "be happy that it happened"]}  />

            <br/>
            <br/>

            <TextSwap fontToObserve={{ family: 'Open Sans' }} words={["debit card", "bad credit"]} />
        </div>
    </React.StrictMode>,
    document.getElementById('root'),
);
