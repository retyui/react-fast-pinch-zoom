import type { ReactNode } from "react";

export interface OnTransformEvent {
  x: number;
  y: number;
  scale: number;
}

export interface OwnProps {
  onTransform: (event: OnTransformEvent) => void;
  children: ReactNode;
  minScale?: number;
}
