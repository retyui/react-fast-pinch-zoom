# &#x3C;PinchZoom/&#x3E; - a react component for pinch zooming DOM elements.


[![react-fast-pinch-zoom on npm](https://badgen.net/npm/v/react-fast-pinch-zoom)](https://www.npmjs.com/package/react-fast-pinch-zoom)
[![react-fast-pinch-zoom downloads](https://badgen.net/npm/dm/react-fast-pinch-zoom)](https://www.npmtrends.com/react-fast-pinch-zoom)
[![react-fast-pinch-zoom bundle size](https://badgen.net/bundlephobia/minzip/react-fast-pinch-zoom)](https://bundlephobia.com/result?p=react-fast-pinch-zoom)


This is a migration of [GoogleChromeLabs/pinch-zoom](https://github.com/GoogleChromeLabs/pinch-zoom) to React!

## Demo

[Simple image pinch-zoom](https://react-fast-pinch-zoom.netlify.app/). Although you can put any element in `<PinchZoom/>`.

## Usage

```sh
yarn add pinch-zoom-element
```

```js
import * as React from "react";
import {
  PinchZoom,
  applyCssProperties,
  getTransform3DValue,
  getTransform2DValue,
} from "react-fast-pinch-zoom";

const App = () => {
  const ref = React.useRef(null);
  const onTransform = React.useCallback(({ x, y, scale }) => {
    // Use CSS Custom Properties (Variables)
    applyCssProperties(ref.current, { x, y, scale });

    // Or use literal transform value
    // ref.current.style.setProperty('transform',getTransform3DValue({x,y,scale}));
    // ref.current.style.setProperty('transform',getTransform2DValue({x,y,scale}));
  }, []);

  return (
    <PinchZoom onTransform={onTransform}>
      <img
        ref={ref}
        alt="two black cats look at you"
        src="https://cdn.glitch.com/d824d0c2-e771-4c9f-9fe2-a66b3ac139c5%2Fcats.jpg"
      />
    </PinchZoom>
  );
};
```

Now the above can be pinch-zoomed!

## API

```js
const App = () => {
  const pinchZoomRef = React.useRef();

  return (
    <PinchZoom ref={pinchZoomRef}>
      <img />
    </PinchZoom>
  );
};
```

### Properties

```js
pinchZoomRef.current.x; // x offset
pinchZoomRef.current.y; // y offset
pinchZoomRef.current.scale; // scale
```

### Methods

Set the transform. All values are optional.

```js
pinchZoomRef.current.setTransform({
  scale: 1,
  x: 0,
  y: 0
});
```

Scale in/out of a particular point.

```js
const scale = 2;

pinchZoomRef.current.scaleTo(scale, {
  // Transform origin. Can be a number, or string percent, eg "50%"
  originX: 0,
  originY: 0,
  // Should the transform origin be relative to the "container", or "content"?
  relativeTo: "content"
});
```
