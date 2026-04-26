import "../../register.js";

import { EmbCodeBlock } from "./emb-code-block.js";

describe("emb-code-block", () => {
  it("renders code content inside preformatted markup", async () => {
    const element = document.createElement("emb-code-block") as EmbCodeBlock;
    element.code = "<emb-button>Save</emb-button>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("pre")).not.toBeNull();
    expect(element.renderRoot.querySelector("code")?.textContent).toContain("<emb-button>");
  });
});
