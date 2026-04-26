import "../../register.js";

import { EmbSpinner } from "./emb-spinner.js";

describe("emb-spinner", () => {
  it("renders a spinner indicator", async () => {
    const element = document.createElement("emb-spinner") as EmbSpinner;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("span")).not.toBeNull();
  });
});
