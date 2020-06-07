import { Pointer } from "./Pointer";

export const isPointerEvent = (event: any): event is PointerEvent =>
  self.PointerEvent && event instanceof PointerEvent;

export const noop = () => {};

export const getDistance = (a: Pointer, b?: Pointer): number =>
  !b
    ? 0
    : Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);

export const getMidpoint = (
  a: Pointer,
  b?: Pointer
): {
  clientX: number;
  clientY: number;
} => {
  if (!b) {
    return a;
  }

  return {
    clientX: (a.clientX + b.clientX) / 2,
    clientY: (a.clientY + b.clientY) / 2
  };
};

export const getAbsoluteValue = (
  value: number | string,
  max: number
): number => {
  if (typeof value === "number") {
    return value;
  }

  if (value.trimRight().endsWith("%")) {
    return (max * parseFloat(value)) / 100;
  }

  return parseFloat(value);
};

export const classNames = (base: string, other?: string): string =>
  other ? `${base} ${other}` : base;
