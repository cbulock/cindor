import "../../register.js";

import { CindorFormRow } from "./cindor-form-row.js";

describe("cindor-form-row", () => {
  it("renders a responsive grid row", async () => {
    const element = document.createElement("cindor-form-row") as CindorFormRow;
    element.columns = 3;
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("columns")).toBe("3");
    expect(element.renderRoot.querySelector(".row")?.getAttribute("style")).toContain("--cindor-form-row-columns: 3");
  });
});
