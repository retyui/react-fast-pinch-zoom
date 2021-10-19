import React, {
  Component,
  HTMLAttributes,
  createRef,
  Children,
  cloneElement,
  Ref,
  ComponentProps,
} from "react";

import { PointerTracker } from "./PointerTracker";
import { createSvg } from "./svg";
import {
  getMidpoint,
  getDistance,
  getAbsoluteValue,
  classNames,
} from "./utils";
import { childClassName, rootClassName } from "./PinchZoom.styles";
import { Pointer } from "./Pointer";
import type { OwnProps } from "./types";

const MIN_SCALE = 0.1;

interface PinchZoomProps extends OwnProps, ComponentProps<"div"> {
  Container?: any;
  children: any;
}

class PinchZoomComponent extends Component<PinchZoomProps>
  implements PublicMethods {
  // @ts-ignore
  private _root: { readonly current: HTMLDivElement } = createRef<
    HTMLDivElement
  >();
  private _svg = createSvg();
  private _transform: SVGMatrix = this._svg.createMatrix();
  private _unsubscribe: () => void = () => {};
  get x() {
    return this._transform.e;
  }
  get y() {
    return this._transform.f;
  }
  get scale() {
    return this._transform.a;
  }

  private get rootBoundingClientRect() {
    return this._root.current.getBoundingClientRect();
  }

  private get childBoundingClientRect() {
    return this._root.current.children[0].getBoundingClientRect();
  }

  componentDidMount() {
    const { current: rootDiv } = this._root;

    // Watch for pointers
    const pointerTracker = new PointerTracker(rootDiv, {
      start: (_, event) => {
        // We only want to track 2 pointers at most
        if (pointerTracker.currentPointers.length === 2) {
          return false;
        }

        event.preventDefault();

        return true;
      },
      move: (previousPointers) => {
        this._onPointerMove(previousPointers, pointerTracker.currentPointers);
      },
    });

    rootDiv.addEventListener("wheel", this._onWheel);

    this._unsubscribe = () => {
      rootDiv.removeEventListener("wheel", this._onWheel);
      pointerTracker.unsubscribe();
    };
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  render() {
    const { children, Container = "div", onTransform, ...props } = this.props;
    const child = Children.only(children);

    return (
      <Container
        {...props}
        ref={this._root}
        className={classNames(rootClassName, props.className)}
      >
        {cloneElement(child, {
          className: classNames(childClassName, child.props.className),
        })}
      </Container>
    );
  }

  /**
   * Update the stage with a given scale/x/y.
   */
  public setTransform(
    opts: {
      x?: number;
      y?: number;
      scale?: number;
    } = {}
  ): void {
    const { scale = this.scale } = opts;
    let { x = this.x, y = this.y } = opts;

    // Get current layout
    const thisBounds = this.rootBoundingClientRect;
    const positioningElBounds = this.childBoundingClientRect;
    // Not displayed. May be disconnected or display:none.
    // Just take the values, and we'll check bounds later.
    if (!thisBounds.width || !thisBounds.height) {
      return this._updateTransform(scale, x, y);
    }
    // Create points for _positioningEl.
    let topLeft = this._svg.createPoint();
    topLeft.x = positioningElBounds.left - thisBounds.left;
    topLeft.y = positioningElBounds.top - thisBounds.top;
    let bottomRight = this._svg.createPoint();
    bottomRight.x = positioningElBounds.width + topLeft.x;
    bottomRight.y = positioningElBounds.height + topLeft.y;
    // Calculate the intended position of _positioningEl.
    const matrix = this._svg
      .createMatrix()
      .translate(x, y)
      .scale(scale)
      // Undo current transform
      .multiply(this._transform.inverse());
    topLeft = topLeft.matrixTransform(matrix);
    bottomRight = bottomRight.matrixTransform(matrix);
    // Ensure _positioningEl can't move beyond out-of-bounds.
    // Correct for x
    if (topLeft.x > thisBounds.width) {
      x += thisBounds.width - topLeft.x;
    } else if (bottomRight.x < 0) {
      x += -bottomRight.x;
    }
    // Correct for y
    if (topLeft.y > thisBounds.height) {
      y += thisBounds.height - topLeft.y;
    } else if (bottomRight.y < 0) {
      y += -bottomRight.y;
    }

    return this._updateTransform(scale, x, y);
  }
  /**
   * Update transform values without checking bounds. This is only called in setTransform.
   */
  private _updateTransform(scale: number, x: number, y: number) {
    const { minScale = MIN_SCALE, onTransform } = this.props;
    // Avoid scaling to zero
    if (scale < minScale) {
      return;
    }

    // Return if there's no change
    if (scale === this.scale && x === this.x && y === this.y) {
      return;
    }

    this._transform.e = x;
    this._transform.f = y;
    this._transform.d = this._transform.a = scale;

    onTransform({ x: this.x, y: this.y, scale: this.scale });
  }

  private _onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const currentRect = this.childBoundingClientRect;
    const { ctrlKey, deltaMode } = event;
    let { deltaY } = event;

    if (deltaMode === 1) {
      // 1 is "lines", 0 is "pixels"
      // Firefox uses "lines" for some types of mouse
      deltaY *= 15;
    }

    // ctrlKey is true when pinch-zooming on a trackpad.
    const divisor = ctrlKey ? 100 : 300;
    const scaleDiff = 1 - deltaY / divisor;

    this._applyChange({
      scaleDiff,
      originX: event.clientX - currentRect.left,
      originY: event.clientY - currentRect.top,
    });
  };

  private _onPointerMove(
    previousPointers: Array<Pointer>,
    currentPointers: Array<Pointer>
  ) {
    // Combine next points with previous points
    const currentRect = this.childBoundingClientRect;
    // For calculating panning movement
    const prevMidpoint = getMidpoint(previousPointers[0], previousPointers[1]);
    const newMidpoint = getMidpoint(currentPointers[0], currentPointers[1]);
    // Midpoint within the element
    const originX = prevMidpoint.clientX - currentRect.left;
    const originY = prevMidpoint.clientY - currentRect.top;
    // Calculate the desired change in scale
    const prevDistance = getDistance(previousPointers[0], previousPointers[1]);
    const newDistance = getDistance(currentPointers[0], currentPointers[1]);
    const scaleDiff = prevDistance ? newDistance / prevDistance : 1;
    this._applyChange({
      originX,
      originY,
      scaleDiff,
      panX: newMidpoint.clientX - prevMidpoint.clientX,
      panY: newMidpoint.clientY - prevMidpoint.clientY,
    });
  }
  /** Transform the view & fire a change event */
  private _applyChange(
    opts: {
      panX?: number;
      panY?: number;
      originX?: number;
      originY?: number;
      scaleDiff?: number;
    } = {}
  ) {
    const {
      panX = 0,
      panY = 0,
      originX = 0,
      originY = 0,
      scaleDiff = 1,
    } = opts;
    const matrix = this._svg
      .createMatrix()
      // Translate according to panning.
      .translate(panX, panY)
      // Scale about the origin.
      .translate(originX, originY)
      // Apply current translate
      .translate(this.x, this.y)
      .scale(scaleDiff)
      .translate(-originX, -originY)
      // Apply current scale.
      .scale(this.scale);

    // Convert the transform into basic translate & scale.
    this.setTransform({ x: matrix.e, y: matrix.f, scale: matrix.a });
  }

  /**
   * Change the scale, adjusting x/y by a given transform origin.
   */
  public scaleTo(
    scale: number,
    opts: {
      originX?: number;
      originY?: number;
      relativeTo?: "content" | "container";
    } = {}
  ) {
    let { originX = 0, originY = 0 } = opts;
    const { relativeTo = "content" } = opts;
    const isRelativeToContent = relativeTo === "content";

    const rect = isRelativeToContent
      ? this.childBoundingClientRect
      : this.rootBoundingClientRect;

    originX = getAbsoluteValue(originX, rect.width);
    originY = getAbsoluteValue(originY, rect.height);

    if (isRelativeToContent) {
      originX += this.x;
      originY += this.y;
    } else {
      const currentRect = this.childBoundingClientRect;
      originX -= currentRect.left;
      originY -= currentRect.top;
    }

    this._applyChange({ originX, originY, scaleDiff: scale / this.scale });
  }
}

interface PublicMethods {
  x: number;
  y: number;
  scale: number;
  scaleTo(
    scale: number,
    options?: {
      originX?: number;
      originY?: number;
      relativeTo?: "content" | "container";
    }
  ): void;
  setTransform(options?: { x?: number; y?: number; scale?: number }): void;
}

interface PinchZoomOverridableComponent {
  <C extends keyof JSX.IntrinsicElements>(
    props: {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      Container: C;
    } & OwnProps & {
        ref?: Ref<PublicMethods>;
      } & Omit<ComponentProps<C>, "ref">
  ): JSX.Element;

  (
    props: {
      Container?: undefined;
    } & OwnProps &
      HTMLAttributes<HTMLDivElement> & { ref?: Ref<PublicMethods> }
  ): JSX.Element;
}

// @ts-ignore
export const PinchZoom: PinchZoomOverridableComponent = PinchZoomComponent;
