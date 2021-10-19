React Text Swap Animation
====

A React component to use CSS animations to swap letters in 2 words.

The text is animated in position after calculating initial and final positions of each letter.  Words which are anagrams will animate well, but you can use any words or phrases.

[![build status](https://img.shields.io/github/workflow/status/scottcanoni/react-text-swap-animation/CI?style=for-the-badge)](https://github.com/scottcanoni/react-text-swap-animation/actions)
[![downloads per month](https://img.shields.io/npm/dm/react-text-swap-animation.svg?style=for-the-badge)](https://www.npmjs.com/package/react-text-swap-animation)
[![total downloads](https://img.shields.io/npm/dt/react-text-swap-animation.svg?style=for-the-badge)](https://www.npmjs.com/package/react-text-swap-animation)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-text-swap-animation?style=for-the-badge)](https://bundlephobia.com/result?p=react-text-swap-animation)

Install
----

`yarn add react-text-swap-animation`

or

`npm install react-text-swap-animation`

Demo
----

[DEMO](https://xwdw2.csb.app/)

[CodeSandbox](https://codesandbox.io/s/react-text-swap-animation-demo-xwdw2)

Usage
----

```js
import React from 'react';
import TextSwap from 'react-text-swap-animation';

export default function MyComponent() {
    return (
        <TextSwap words={['Text Swap Animation', 'Antitoxin Swamp Tea']} />
    );
}
```

To control the animation speed and timing, you can pass an object of `animationOptions`.

```js
<TextSwap animationOptions={{
    randomStartMin: 0,
    randomStartMax: 0,
    randomReverseMin: 6000,
    randomReverseMax: 6000,
    loopAnimation: 20000,
    waitToStart: 5000,
}} />
```

If you are using an embedded font and need to wait for it to load before animating, 
then you should specify the `fontToObserve` object with the font family name and/or other font specifics.

```js
<TextSwap fontToObserve={{ family: 'Open Sans' }} />
```
```js
<TextSwap fontToObserve={{
    family: 'Roboto',
    weight: 600,
    style: 'italic',
    stretch: 'expanded',
}} />
```

API
----

### Props

| Prop               | Type   | Default                                          | Description                                             |
| :----------------- | :----- | :------------------------------------------------| :------------------------------------------------------ |
| `words`            | array  | `['Text Swap Animation', 'Antitoxin Swamp Tea']` | An array containing exactly 2 words which are an anagram of each other. |
| `animationOptions` | object | `AnimationOptions`                               | Timing options for when to start, how fast to animate forwards, backwards, and when to loop (optional). |
| `fontToObserve`    | object | `FontToObserve`                                  | A description of an embedded font to observe and wait until loaded.  If not specified, animation will loaded immediately (optional). |

#### AnimationOptions

| Property           | Type   | Default | Description                                                                                   |
| :----------------- | :----- | :------ | :-------------------------------------------------------------------------------------------- |
| `randomStartMin`   | number | `0`     | The minimum amount of time to randomly wait before starting to animate each letter            |
| `randomStartMax`   | number | `3000`  | The maximum amount of time to randomly wait before starting to animate each letter            |
| `randomReverseMin` | number | `6000`  | The minimum amount of time to randomly wait before starting to animate each letter in reverse |
| `randomReverseMax` | number | `9000`  | The maximum amount of time to randomly wait before starting to animate each letter in reverse |
| `loopAnimation`    | number | `12000` | The amount of time for each full loop of the animation                                        |
| `waitToStart`      | number | `0`     | The amount of time to wait before beginning the animation on start up                         |

#### FontToObserve

This object is passed along to [Font Face Observer](https://github.com/iamskok/use-font-face-observer)

| Property  | Type             | Description                                              |
| :---------| :--------------- | :------------------------------------------------------- |
| `family`  | string           | The font-family: `Roboto`, `Inter`, `Open Sans`, etc     |
| `weight`  | string or number | The font-weight: `normal`, `bold`, `800`, etc            |
| `style`   | string           | The font-style: `normal`, `italic`, `oblique`            |
| `stretch` | string           | The font stretch: `normal`, `condensed`, `expanded`, etc |

Styling
----

You can use the CSS transition property to adjust the speed and duration of the animation completely.  Can you find a neat transition animation? Please share! :)

```css
.text-swap .word .letter {
    transition: all, 2s, cubic-bezier(0.1, 0.7, 1.0, 0.1), 2s;
}
```

Run Locally
----

To run demo locally:

- `yarn`
- `yarn start`

and a browser will open to the demo.

Future Ideas
----

- Supply different animation easing.


License
----

WTFPL
