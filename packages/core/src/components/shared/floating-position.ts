import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement
} from "@floating-ui/dom";

type FloatingHandle = {
  cleanup: () => void;
  update: () => void;
};

type FloatingPositionOptions = {
  floating: HTMLElement;
  matchReferenceWidth?: boolean;
  offsetDistance?: number;
  placement: Placement;
  reference: HTMLElement;
};

export function attachFloatingPosition({
  floating,
  matchReferenceWidth = false,
  offsetDistance = 8,
  placement,
  reference
}: FloatingPositionOptions): FloatingHandle {
  const updatePosition = async (): Promise<void> => {
    const middleware = [offset(offsetDistance), flip(), shift({ padding: 8 })];

    if (matchReferenceWidth) {
      middleware.push(
        size({
          apply({ rects }) {
            floating.style.width = `${rects.reference.width}px`;
          }
        })
      );
    }

    const { x, y } = await computePosition(reference, floating, {
      middleware,
      placement,
      strategy: "fixed"
    });

    floating.style.position = "fixed";
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
  };

  const cleanup = autoUpdate(reference, floating, () => {
    void updatePosition();
  }, {
    ancestorResize: true,
    ancestorScroll: true,
    animationFrame: false,
    elementResize: typeof ResizeObserver === "function",
    layoutShift: typeof IntersectionObserver === "function"
  });

  void updatePosition();

  return {
    cleanup,
    update: () => {
      void updatePosition();
    }
  };
}
