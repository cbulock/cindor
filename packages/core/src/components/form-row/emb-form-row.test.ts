import "../../register.js";

import { EmbFormRow } from "./emb-form-row.js";

describe("emb-form-row", () => {
  it("renders a responsive grid row", async () => {
    const element = document.createElement("emb-form-row") as EmbFormRow;
    element.columns = 3;
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("columns")).toBe("3");
    expect(element.renderRoot.querySelector(".row")?.getAttribute("style")).toContain("--emb-form-row-columns: 3");
  });
});
