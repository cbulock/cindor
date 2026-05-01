import "../../register.js";

import { CindorUrlInput } from "./cindor-url-input.js";

describe("cindor-url-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a native url input", async () => {
    const element = document.createElement("cindor-url-input") as CindorUrlInput;
    element.value = "https://cindor.dev";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("type")).toBe("url");
    expect(input?.value).toBe("https://cindor.dev");
  });

  it("applies url autocomplete and supports reset plus aria forwarding", async () => {
    const element = document.createElement("cindor-url-input") as CindorUrlInput;
    element.setAttribute("value", "https://cindor.dev");
    element.value = "https://cindor.dev";
    element.setAttribute("aria-label", "Project URL");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.autocomplete).toBe("url");
    expect(input.getAttribute("aria-label")).toBe("Project URL");

    input.value = "https://cindor.dev/docs";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("https://cindor.dev/docs");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("https://cindor.dev");
    expect(input.value).toBe("https://cindor.dev");
  });
});
