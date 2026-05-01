import "../../register.js";

import { EmbTag } from "./emb-tag.js";

describe("emb-tag", () => {
  it("renders accent tone by default", async () => {
    const element = document.createElement("emb-tag") as EmbTag;

    document.body.append(element);
    await element.updateComplete;

    expect(element.tone).toBe("accent");
    expect(element.getAttribute("tone")).toBe("accent");
  });

  it("dispatches remove when dismissible", async () => {
    const element = document.createElement("emb-tag") as EmbTag;
    element.dismissible = true;
    element.textContent = "Bug";

    const handleRemove = vi.fn();
    element.addEventListener("remove", handleRemove);

    document.body.append(element);
    await element.updateComplete;

    const removeButton = element.renderRoot.querySelector("button");
    removeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(handleRemove).toHaveBeenCalledTimes(1);
  });
});
