import "../../register.js";

import { CindorDrawer } from "./cindor-drawer.js";

describe("cindor-drawer", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("closes from the keyboard escape shortcut", async () => {
    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const panel = element.renderRoot.querySelector('[part="panel"]') as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("restores focus to the previously focused element when closing", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open drawer";
    document.body.append(trigger);
    trigger.focus();

    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;
    await Promise.resolve();

    element.close();
    await element.updateComplete;

    expect(document.activeElement).toBe(trigger);
  });

  it("restores focus to the deepest opener inside nested shadow DOM", async () => {
    const tagName = "test-shadow-opener";
    if (!customElements.get(tagName)) {
      customElements.define(
        tagName,
        class extends HTMLElement {
          constructor() {
            super();
            const shadowRoot = this.attachShadow({ mode: "open" });
            const button = document.createElement("button");
            button.textContent = "Open drawer";
            shadowRoot.append(button);
          }
        }
      );
    }

    const opener = document.createElement(tagName);
    document.body.append(opener);
    const button = opener.shadowRoot?.querySelector("button") as HTMLButtonElement;
    button.focus();

    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;
    await Promise.resolve();

    element.close();
    await element.updateComplete;

    expect(opener.shadowRoot?.activeElement).toBe(button);
  });

  it("closes when the backdrop is clicked", async () => {
    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const backdrop = element.renderRoot.querySelector(".backdrop");
    const closeButton = element.renderRoot.querySelector('[part="close-button"]');
    backdrop!.dispatchEvent(new Event("click"));
    await element.updateComplete;

    expect(closeButton).not.toBeNull();
    expect(element.open).toBe(false);
  });

  it("closes from the built-in close button", async () => {
    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const closeButton = element.renderRoot.querySelector('[part="close-button"]') as HTMLElement;
    closeButton.dispatchEvent(new Event("click", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("renders dialog semantics when open", async () => {
    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    element.setAttribute("aria-label", "Filters");
    document.body.append(element);
    await element.updateComplete;

    const panel = element.renderRoot.querySelector('[part="panel"]');

    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-modal")).toBe("true");
    expect(panel?.getAttribute("aria-label")).toBe("Filters");
    expect(panel?.tagName).toBe("ASIDE");
  });

  it("forwards aria-labelledby and aria-describedby to the dialog surface", async () => {
    document.body.innerHTML = `
      <h2 id="drawer-title">Filters</h2>
      <p id="drawer-description">Refine the current results.</p>
    `;

    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    element.setAttribute("aria-labelledby", "drawer-title");
    element.setAttribute("aria-describedby", "drawer-description");
    document.body.append(element);
    await element.updateComplete;

    const panel = element.renderRoot.querySelector('[part="panel"]');

    const labelledById = panel?.getAttribute("aria-labelledby");
    const describedById = panel?.getAttribute("aria-describedby");

    expect(labelledById).toMatch(/-label$/);
    expect(describedById).toMatch(/-description$/);
    expect(element.renderRoot.querySelector(`#${labelledById ?? ""}`)?.textContent).toBe("Filters");
    expect(element.renderRoot.querySelector(`#${describedById ?? ""}`)?.textContent).toBe("Refine the current results.");
    expect(element.hasAttribute("aria-labelledby")).toBe(false);
    expect(element.hasAttribute("aria-describedby")).toBe(false);
  });

  it("moves focus to the panel when opening and emits a close event", async () => {
    const element = document.createElement("cindor-drawer") as CindorDrawer;
    const closed = vi.fn();
    element.addEventListener("close", closed);
    document.body.append(element);

    element.open = true;
    await element.updateComplete;
    await Promise.resolve();

    expect((element.renderRoot as ShadowRoot).activeElement).toBe(element.renderRoot.querySelector('[part="panel"]'));

    element.close();

    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("ignores unrelated keyboard input while remaining open", async () => {
    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const panel = element.renderRoot.querySelector('[part="panel"]') as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await element.updateComplete;

    expect(element.open).toBe(true);
  });

  it("traps tab navigation across slotted interactive content", async () => {
    const element = document.createElement("cindor-drawer") as CindorDrawer;
    element.open = true;
    element.innerHTML = `<button id="slotted-action">Apply</button>`;
    document.body.append(element);
    await element.updateComplete;

    const panel = element.renderRoot.querySelector('[part="panel"]') as HTMLElement;
    const closeButton = element.renderRoot.querySelector('[part="close-button"]') as HTMLElement;
    const slottedButton = element.querySelector("#slotted-action") as HTMLButtonElement;

    slottedButton.focus();
    const tabEvent = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Tab" });
    const dispatchResult = panel.dispatchEvent(tabEvent);
    await element.updateComplete;

    expect(closeButton).not.toBeNull();
    expect(dispatchResult).toBe(false);
    expect(tabEvent.defaultPrevented).toBe(true);
  });
});
