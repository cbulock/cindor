import "../../register.js";

import { EmbFieldset } from "./emb-fieldset.js";

describe("emb-fieldset", () => {
  it("renders a native fieldset and legend", async () => {
    const element = document.createElement("emb-fieldset") as EmbFieldset;
    element.legend = "Preferences";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("fieldset")).not.toBeNull();
    expect(element.renderRoot.querySelector("legend")?.textContent).toContain("Preferences");
  });
});
