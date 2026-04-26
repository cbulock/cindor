import "../../register.js";

import { EmbDivider } from "./emb-divider.js";

describe("emb-divider", () => {
  it("renders a horizontal rule", async () => {
    const element = document.createElement("emb-divider") as EmbDivider;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("hr")).not.toBeNull();
  });
});
