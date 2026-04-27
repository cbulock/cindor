import "../../register.js";

import { EmbInput } from "./emb-input.js";

describe("emb-input", () => {
  it("syncs host value from the native input element", async () => {
    const element = document.createElement("emb-input") as EmbInput;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    expect(input).not.toBeNull();

    input!.value = "hello";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("hello");
  });

  it("forwards host labelling attributes to the internal input", async () => {
    const element = document.createElement("emb-input") as EmbInput;
    element.setAttribute("aria-label", "Project name");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("aria-label")).toBe("Project name");
  });

  it("renders configured start and end icons", async () => {
    const element = document.createElement("emb-input") as EmbInput;
    element.startIcon = "search";
    element.endIcon = "x";
    document.body.append(element);
    await element.updateComplete;

    const icons = element.renderRoot.querySelectorAll("emb-icon");

    expect(icons).toHaveLength(2);
    expect(icons[0]?.getAttribute("name")).toBe("search");
    expect(icons[1]?.getAttribute("name")).toBe("x");
  });
});
