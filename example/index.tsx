import React, { useRef, useCallback } from "react";
import { render } from "react-dom";

import { PinchZoom, OnTransformEvent, applyCssProperties } from "..";

const App = () => {
  const ref = useRef<HTMLImageElement>(null);
  const onTransform = useCallback(({ x, y, scale }: OnTransformEvent) => {
    applyCssProperties(ref.current, { x, y, scale });
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

render(<App />, document.querySelector("#root"));
