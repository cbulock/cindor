import "../../register.js";

import { CindorPopover } from "./cindor-popover.js";

describe("cindor-popover", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs open state from native details", async () => {
    const element = document.createElement("cindor-popover") as CindorPopover;
    element.innerHTML = '<button slot="trigger">Open</button><p>Body</p>';
    document.body.append(element);
    await element.updateComplete;

    const details = element.renderRoot.querySelector("details");
    details!.open = true;
    details!.dispatchEvent(new Event("toggle"));
    await element.updateComplete;
    await Promise.resolve();

    expect(element.open).toBe(true);
  });

  it("dispatches toggle events and mirrors closed details state", async () => {
    const element = document.createElement("cindor-popover") as CindorPopover;
    const toggled = vi.fn();
    element.open = true;
    element.addEventListener("toggle", toggled);
    element.innerHTML = '<button slot="trigger">Open</button><p>Body</p>';
    document.body.append(element);
    await element.updateComplete;

    const details = element.renderRoot.querySelector("details") as HTMLDetailsElement;
    expect(details.open).toBe(true);

    details.open = false;
    details.dispatchEvent(new Event("toggle"));
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(toggled).toHaveBeenCalledTimes(1);
  });

  it("renders the trigger and panel parts while open", async () => {
    const element = document.createElement("cindor-popover") as CindorPopover;
    element.open = true;
    element.innerHTML = '<button slot="trigger">Open</button><p>Body</p>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="trigger"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[part="panel"] slot:not([name])')).not.toBeNull();
  });
});
