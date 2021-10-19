import React from "react";
import { PinchZoom } from "../PinchZoom";

export const div = (
  // @ts-expect-error div does not include href props
  <PinchZoom href="/link" onTransform={() => {}}>
    <img />
  </PinchZoom>
);

export const div2 = (
  <PinchZoom
    onTransform={({ scale, x, y }) => {
      x.toFixed();
      y.toFixed();
      scale.toFixed();

      // @ts-expect-error number incompatible with string
      x.startsWith();
      // @ts-expect-error number incompatible with string
      y.startsWith();
      // @ts-expect-error number incompatible with string
      scale.startsWith();
    }}
  >
    <img />
  </PinchZoom>
);

export const link = (
  <PinchZoom href="/link" Container="a" onTransform={() => {}}>
    <img />
  </PinchZoom>
);

export const link2 = (
  <PinchZoom
    href="/link"
    Container="a"
    // @ts-expect-error need Function
    onTransform={null}
  >
    <img />
  </PinchZoom>
);

export const divRef = (
  <PinchZoom
    ref={a => {
      if (a) {
        a.scaleTo(1, { originX: 0, originY: 0, relativeTo: "container" });
        a.setTransform({ scale: 1, x: 0, y: 0 });

        a.scaleTo(
          // @ts-expect-error need number
          "1",
          { originX: 0, originY: 0, relativeTo: "container" }
        );
        a.setTransform({
          // @ts-expect-error need number
          scale: "1",
          x: 0,
          y: 0
        });
      }
    }}
    onTransform={() => {}}
  >
    <img />
  </PinchZoom>
);

export const linkRef = (
  <PinchZoom
    href="/link"
    Container="a"
    ref={a => {
      if (a) {
        a.scaleTo(1, { originX: 0, originY: 0, relativeTo: "container" });
        a.setTransform({ scale: 1, x: 0, y: 0 });

        a.scaleTo(
          // @ts-expect-error need number
          "1",
          { originX: 0, originY: 0, relativeTo: "container" }
        );
        a.setTransform({
          // @ts-expect-error need number
          scale: "1",
          x: 0,
          y: 0
        });
      }
    }}
    onTransform={() => {}}
  >
    <img />
  </PinchZoom>
);
