import "../../register.js";

import { CindorIcon } from "./cindor-icon.js";

describe("cindor-icon", () => {
  async function waitForIcon(element: CindorIcon): Promise<SVGElement | null> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await element.updateComplete;
      const icon = element.renderRoot.querySelector("svg");
      if (icon) {
        return icon;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    }

    return element.renderRoot.querySelector("svg");
  }

  it("renders a Lucide icon with accessible labelling", async () => {
    const element = document.createElement("cindor-icon") as CindorIcon;
    element.name = "alarm-clock";
    element.label = "Alarm clock";
    element.size = 18;
    element.strokeWidth = 1.5;
    document.body.append(element);
    const icon = await waitForIcon(element);

    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-label")).toBe("Alarm clock");
    expect(icon?.getAttribute("width")).toBe("18");
    expect(icon?.getAttribute("stroke-width")).toBe("1.5");
    expect(icon?.getAttribute("style")).toContain("stroke-linecap: var(--cindor-lucide-icon-linecap, round)");
    expect(icon?.querySelectorAll("*").length).toBeGreaterThan(0);
  });

  it("normalizes Lucide export names to kebab-case icon names", async () => {
    const element = document.createElement("cindor-icon") as CindorIcon;
    element.name = "AlarmClock";
    document.body.append(element);
    const icon = await waitForIcon(element);

    expect(icon).not.toBeNull();
  });
});
