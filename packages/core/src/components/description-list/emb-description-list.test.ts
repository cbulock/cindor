import "../../register.js";

import { EmbDescriptionList } from "./emb-description-list.js";

describe("emb-description-list", () => {
  it("renders a description list", async () => {
    const element = document.createElement("emb-description-list") as EmbDescriptionList;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("dl")).not.toBeNull();
  });
});
