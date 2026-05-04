import "../../register.js";

import { CindorTooltip } from "./cindor-tooltip.js";

describe("cindor-tooltip", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("opens on mouseenter", async () => {
    const element = document.createElement("cindor-tooltip") as CindorTooltip;
    element.text = "Helpful hint";
    element.innerHTML = "<button>Trigger</button>";
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.querySelector("button");
    trigger!.dispatchEvent(new Event("mouseenter"));
    await element.updateComplete;
    await Promise.resolve();

    expect(element.open).toBe(true);
    expect(element.renderRoot.querySelector('[role="tooltip"]')).not.toBeNull();
    expect((element.querySelector("button"))?.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("opens on focus and closes on focusout", async () => {
    const element = document.createElement("cindor-tooltip") as CindorTooltip;
    element.text = "Helpful hint";
    element.innerHTML = "<button>Trigger</button>";
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.querySelector("button") as HTMLButtonElement;
    trigger.dispatchEvent(new FocusEvent("focusin"));
    await element.updateComplete;

    expect(element.open).toBe(true);
    expect(trigger.getAttribute("aria-describedby")).toBeTruthy();

    trigger.dispatchEvent(new FocusEvent("focusout"));
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  });

  it("closes on escape and removes aria-describedby", async () => {
    const element = document.createElement("cindor-tooltip") as CindorTooltip;
    element.text = "Helpful hint";
    element.innerHTML = "<button>Trigger</button>";
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.querySelector("button") as HTMLButtonElement;
    trigger.dispatchEvent(new Event("mouseenter"));
    await element.updateComplete;

    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  });

  it("preserves existing aria-describedby tokens on the trigger", async () => {
    document.body.innerHTML = `<div id="existing-help">Existing help</div>`;

    const element = document.createElement("cindor-tooltip") as CindorTooltip;
    element.text = "Helpful hint";
    element.innerHTML = '<button aria-describedby="existing-help">Trigger</button>';
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.querySelector("button") as HTMLButtonElement;
    trigger.dispatchEvent(new Event("mouseenter"));
    await element.updateComplete;

    expect(trigger.getAttribute("aria-describedby")).toMatch(/^existing-help /);

    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await element.updateComplete;

    expect(trigger.getAttribute("aria-describedby")).toBe("existing-help");
  });
});
