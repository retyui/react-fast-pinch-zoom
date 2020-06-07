import { Pointer } from "./Pointer";
import { noop, isPointerEvent } from "./utils";

type Callbacks = {
  start?: (
    pointer: Pointer,
    event: TouchEvent | PointerEvent | MouseEvent
  ) => boolean;
  move?: (
    previousPointers: Array<Pointer>,
    trackedChangedPointers: Array<Pointer>,
    event: MouseEvent | TouchEvent
  ) => void;
  end?: (
    pointer: Pointer,
    event: PointerEvent | MouseEvent | TouchEvent
  ) => void;
};

const removeEventListener = "removeEventListener";
const addEventListener = "addEventListener";

export class PointerTracker {
  /**
   * Track pointers across a particular element
   *
   * @param root Element to monitor.
   * @param callbacks
   */
  e: Element;
  startPointers: Array<Pointer>;
  currentPointers: Array<Pointer>;
  _startCallback: Required<Callbacks>["start"];
  _moveCallback: Required<Callbacks>["move"];
  _endCallback: Required<Callbacks>["end"];

  constructor(root: Element, callbacks: Callbacks) {
    const { start = () => true, move = noop, end = noop } = callbacks;

    this.e = root;
    /**
     * State of the tracked pointers when they were pressed/touched.
     */
    this.startPointers = [];
    /**
     * Latest state of the tracked pointers. Contains the same number
     * of pointers, and in the same order as this.startPointers.
     */
    this.currentPointers = [];
    this._startCallback = start;
    this._moveCallback = move;
    this._endCallback = end;

    // Bind methods
    this._pointerStart = this._pointerStart.bind(this);
    this._touchStart = this._touchStart.bind(this);
    this._move = this._move.bind(this);
    this._triggerPointerEnd = this._triggerPointerEnd.bind(this);
    this._pointerEnd = this._pointerEnd.bind(this);
    this._touchEnd = this._touchEnd.bind(this);

    // Add listeners
    if (self.PointerEvent) {
      this.e[addEventListener]("pointerdown", this._pointerStart);
    } else {
      this.e[addEventListener]("mousedown", this._pointerStart);
      this.e[addEventListener]("touchstart", this._touchStart);
      this.e[addEventListener]("touchmove", this._move);
      this.e[addEventListener]("touchend", this._touchEnd);
    }
  }

  public unsubscribe() {
    [
      ["mousedown", this._pointerStart],
      ["pointerdown", this._pointerStart],
      ["pointermove", this._move],
      ["pointerup", this._pointerEnd],
      ["touchend", this._touchEnd],
      ["touchmove", this._move],
      ["touchstart", this._touchStart],
      ["mousemove", this._move],
      ["mouseup", this._pointerEnd]
    ].forEach(([eventName, fn]) => {
      this.e[removeEventListener](
        // @ts-ignore
        eventName,
        fn
      );
    });
  }

  /**
   * Call the start callback for this pointer, and track it if the user wants.
   *
   * @param pointer Pointer
   * @param event Related event
   * @returns Whether the pointer is being tracked.
   */
  private _triggerPointerStart(
    pointer: Pointer,
    event: TouchEvent | PointerEvent | MouseEvent
  ) {
    if (!this._startCallback(pointer, event)) {
      return false;
    }

    this.currentPointers.push(pointer);
    this.startPointers.push(pointer);

    return true;
  }

  /**
   * Listener for mouse/pointer starts. Bound to the class in the constructor.
   *
   * @param event This will only be a MouseEvent if the browser doesn't support
   * pointer events.
   */
  private _pointerStart(event: PointerEvent | MouseEvent) {
    /* Left */
    if (event.button !== 0) {
      return;
    }

    if (!this._triggerPointerStart(new Pointer(event), event)) {
      return;
    }

    // Add listeners for additional events.
    // The listeners may already exist, but no harm in adding them again.
    if (isPointerEvent(event)) {
      this.e.setPointerCapture(event.pointerId);
      this.e[addEventListener]("pointermove", this._move);
      this.e[addEventListener]("pointerup", this._pointerEnd);
    } else {
      // MouseEvent
      this.e[addEventListener]("mousemove", this._move);
      this.e[addEventListener]("mouseup", this._pointerEnd);
    }
  }

  /**
   * Listener for touchstart. Bound to the class in the constructor.
   * Only used if the browser doesn't support pointer events.
   */
  private _touchStart(event: TouchEvent) {
    for (const touch of Array.from(event.changedTouches)) {
      this._triggerPointerStart(new Pointer(touch), event);
    }
  }

  /**
   * Listener for pointer/mouse/touch move events.
   * Bound to the class in the constructor.
   */
  private _move(event: MouseEvent | TouchEvent) {
    const previousPointers = this.currentPointers.slice();
    const changedPointers =
      "changedTouches" in event // Shortcut for 'is touch event'.
        ? Array.from(event.changedTouches).map(t => new Pointer(t))
        : [new Pointer(event)];

    const trackedChangedPointers: Array<Pointer> = [];

    for (const pointer of changedPointers) {
      const index = this.currentPointers.findIndex(p => p.id === pointer.id);

      if (index === -1) {
        // Not a pointer we're tracking
        continue;
      }

      trackedChangedPointers.push(pointer);
      this.currentPointers[index] = pointer;
    }

    if (trackedChangedPointers.length === 0) {
      return;
    }

    this._moveCallback(previousPointers, trackedChangedPointers, event);
  }

  /**
   * Call the end callback for this pointer.
   *
   * @param pointer Pointer
   * @param event Related event
   */
  private _triggerPointerEnd(
    pointer: Pointer,
    event: PointerEvent | MouseEvent | TouchEvent
  ) {
    const index = this.currentPointers.findIndex(p => p.id === pointer.id);

    // Not a pointer we're interested in?
    if (index === -1) {
      return false;
    }

    this.currentPointers.splice(index, 1);
    this.startPointers.splice(index, 1);
    this._endCallback(pointer, event);

    return true;
  }

  /**
   * Listener for mouse/pointer ends. Bound to the class in the constructor.
   * @param event This will only be a MouseEvent if the browser doesn't support
   * pointer events.
   */
  private _pointerEnd(event: PointerEvent | MouseEvent) {
    if (!this._triggerPointerEnd(new Pointer(event), event)) {
      return;
    }

    if (isPointerEvent(event)) {
      if (this.currentPointers.length > 0) {
        return;
      }

      this.e[removeEventListener]("pointermove", this._move);
      this.e[removeEventListener]("pointerup", this._pointerEnd);
    } else {
      // MouseEvent
      this.e[removeEventListener]("mousemove", this._move);
      this.e[removeEventListener]("mouseup", this._pointerEnd);
    }
  }

  /**
   * Listener for touchend. Bound to the class in the constructor.
   * Only used if the browser doesn't support pointer events.
   */
  private _touchEnd(event: TouchEvent) {
    for (const touch of Array.from(event.changedTouches)) {
      this._triggerPointerEnd(new Pointer(touch), event);
    }
  }
}
