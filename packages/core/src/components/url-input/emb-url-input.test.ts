import "../../register.js";

import { EmbUrlInput } from "./emb-url-input.js";

describe("emb-url-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a native url input", async () => {
    const element = document.createElement("emb-url-input") as EmbUrlInput;
    element.value = "https://emberline.dev";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("type")).toBe("url");
    expect(input?.value).toBe("https://emberline.dev");
  });

  it("applies url autocomplete and supports reset plus aria forwarding", async () => {
    const element = document.createElement("emb-url-input") as EmbUrlInput;
    element.setAttribute("value", "https://emberline.dev");
    element.value = "https://emberline.dev";
    element.setAttribute("aria-label", "Project URL");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.autocomplete).toBe("url");
    expect(input.getAttribute("aria-label")).toBe("Project URL");

    input.value = "https://emberline.dev/docs";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("https://emberline.dev/docs");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("https://emberline.dev");
    expect(input.value).toBe("https://emberline.dev");
  });
});
