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

            <TextSwap fontToObserve={{ family: 'Open Sans' }} words={["debit card", "bad credit"]} />
        </div>
    </React.StrictMode>,
    document.getElementById('root'),
);
