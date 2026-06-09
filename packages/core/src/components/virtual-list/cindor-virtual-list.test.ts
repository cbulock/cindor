import { html } from "lit";

import "../../register.js";

import { CindorVirtualList } from "./cindor-virtual-list.js";

describe("cindor-virtual-list", () => {
  it("renders the empty message when there are no items", async () => {
    const element = document.createElement("cindor-virtual-list") as unknown as CindorVirtualList;
    element.emptyMessage = "Nothing here yet.";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="empty"]')?.textContent).toContain("Nothing here yet.");
  });

  it("renders only the visible range plus overscan", async () => {
    const resizeObserverController = installResizeObserverMock();
    const element = document.createElement("cindor-virtual-list") as unknown as CindorVirtualList<string>;
    element.height = "120px";
    element.itemHeight = 30;
    element.overscan = 0;
    element.items = Array.from({ length: 20 }, (_, index) => `Item ${index}`);
    document.body.append(element);
    await element.updateComplete;

    const viewport = element.renderRoot.querySelector<HTMLElement>('[part="viewport"]');
    expect(viewport).not.toBeNull();
    Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 120 });
    resizeObserverController.flush();
    await element.updateComplete;

    const rows = element.renderRoot.querySelectorAll('[part="item"]');
    expect(rows).toHaveLength(4);
    expect(rows[0]?.textContent).toContain("Item 0");
    expect(Array.from(rows).some((row) => row.textContent?.includes("Item 10"))).toBe(false);

    resizeObserverController.restore();
  });

  it("updates the range after scrolling and emits range-change", async () => {
    const resizeObserverController = installResizeObserverMock();
    const element = document.createElement("cindor-virtual-list") as unknown as CindorVirtualList<string>;
    element.height = "120px";
    element.itemHeight = 30;
    element.overscan = 0;
    element.items = Array.from({ length: 30 }, (_, index) => `Item ${index}`);
    const rangeListener = vi.fn();
    element.addEventListener("range-change", rangeListener);
    document.body.append(element);
    await element.updateComplete;

    const viewport = element.renderRoot.querySelector<HTMLElement>('[part="viewport"]');
    expect(viewport).not.toBeNull();
    Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 120 });
    Object.defineProperty(viewport, "scrollTop", { configurable: true, value: 300, writable: true });
    resizeObserverController.flush();
    viewport?.dispatchEvent(new Event("scroll"));
    await element.updateComplete;

    const rows = element.renderRoot.querySelectorAll('[part="item"]');
    expect(rows[0]?.getAttribute("data-index")).toBe("10");
    expect(rangeListener).toHaveBeenCalled();
    expect(rangeListener.mock.calls.at(-1)?.[0].detail.visibleStartIndex).toBe(10);

    resizeObserverController.restore();
  });

  it("uses the custom item renderer when provided", async () => {
    const resizeObserverController = installResizeObserverMock();
    const element = document.createElement("cindor-virtual-list") as unknown as CindorVirtualList<{ label: string }>;
    element.height = "90px";
    element.itemHeight = 30;
    element.overscan = 0;
    element.items = [{ label: "Alpha" }, { label: "Beta" }, { label: "Gamma" }];
    element.renderItem = ({ item, index }) => html`<span class="custom-row">${index + 1}. ${item.label}</span>`;
    document.body.append(element);
    await element.updateComplete;

    const viewport = element.renderRoot.querySelector<HTMLElement>('[part="viewport"]');
    Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 90 });
    resizeObserverController.flush();
    await element.updateComplete;

    expect(element.renderRoot.querySelector(".custom-row")?.textContent).toContain("1. Alpha");

    resizeObserverController.restore();
  });
});

function installResizeObserverMock(): { flush: () => void; restore: () => void } {
  const callbacks = new Set<ResizeObserverCallback>();
  const originalResizeObserver = globalThis.ResizeObserver;

  class ResizeObserverMock {
    constructor(private readonly callback: ResizeObserverCallback) {
      callbacks.add(callback);
    }

    observe() {}

    unobserve() {}

    disconnect() {
      callbacks.delete(this.callback);
    }
  }

  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

  return {
    flush() {
      for (const callback of callbacks) {
        callback([], {} as ResizeObserver);
      }
    },
    restore() {
      globalThis.ResizeObserver = originalResizeObserver;
    }
  };
}
