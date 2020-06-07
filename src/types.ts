export type OnTransformEvent = { x: number; y: number; scale: number };

export type OwnProps = {
  onTransform: (event: OnTransformEvent) => void;
  children: JSX.Element;
  minScale?: number;
};
