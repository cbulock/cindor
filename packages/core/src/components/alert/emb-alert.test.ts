import "../../register.js";

import { EmbAlert } from "./emb-alert.js";

describe("emb-alert", () => {
  it("renders an alert region", async () => {
    const element = document.createElement("emb-alert") as EmbAlert;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="alert"]')).not.toBeNull();
  });
});
