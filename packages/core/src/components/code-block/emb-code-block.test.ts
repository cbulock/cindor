import "../../register.js";

import { EmbCodeBlock } from "./emb-code-block.js";

describe("emb-code-block", () => {
  it("renders highlighted code content inside preformatted markup", async () => {
    const element = document.createElement("emb-code-block") as EmbCodeBlock;
    element.code = "<emb-button>Save</emb-button>";
    element.language = "html";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("pre")).not.toBeNull();
    expect(element.renderRoot.querySelector("code")?.textContent).toContain("<emb-button>");
    expect(element.renderRoot.querySelector(".hljs-tag")).not.toBeNull();
  });

  it("falls back to auto-detection when no language hint is provided", async () => {
    const element = document.createElement("emb-code-block") as EmbCodeBlock;
    element.code = "const answer = 42;";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("code")?.className).toContain("hljs");
    expect(element.renderRoot.querySelector("code")?.innerHTML).toContain("<span");
  });

  it("renders slotted code when the code prop is empty", async () => {
    const element = document.createElement("emb-code-block") as EmbCodeBlock;
    element.language = "css";
    element.textContent = ".demo { color: red; }";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("code")?.textContent).toContain(".demo");
  });
});
