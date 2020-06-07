import { isPointerEvent } from "./utils";

export class Pointer {
  id: number;
  pageX: number;
  pageY: number;
  clientX: number;
  clientY: number;

  constructor(nativePointer: MouseEvent | PointerEvent | Touch) {
    this.id = -1;
    this.pageX = nativePointer.pageX;
    this.pageY = nativePointer.pageY;
    this.clientX = nativePointer.clientX;
    this.clientY = nativePointer.clientY;

    if (self.Touch && nativePointer instanceof Touch) {
      // is Touch
      this.id = nativePointer.identifier;
    } else if (isPointerEvent(nativePointer)) {
      // is PointerEvent
      this.id = nativePointer.pointerId;
    }
  }
}
