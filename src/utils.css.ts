export const applyCssProperties = (
  element: HTMLElement | null,
  { x, y, scale }: { x: number; y: number; scale: number }
) => {
  if (!element) {
    return;
  }

  element.style.setProperty("--x", x + "px");
  element.style.setProperty("--y", y + "px");
  element.style.setProperty("--scale", scale + "");
};

export const getTransform2DValue = ({
  x,
  y,
  scale
}: {
  x: number;
  y: number;
  scale: number;
}) => `translate(${x}px, ${y}px) scale(${scale})`;

export const getTransform3DValue = ({
  x,
  y,
  scale
}: {
  x: number;
  y: number;
  scale: number;
}) => `translate3d(${x}px, ${y}px, 0) scale3d(${scale},${scale}, 1)`;
