import "../../register.js";

import { EmbTextarea } from "./emb-textarea.js";

describe("emb-textarea", () => {
  it("syncs host value from the native textarea element", async () => {
    const element = document.createElement("emb-textarea") as EmbTextarea;
    document.body.append(element);
    await element.updateComplete;

    const textarea = element.renderRoot.querySelector("textarea");
    expect(textarea).not.toBeNull();

    textarea!.value = "notes";
    textarea!.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("notes");
  });
});
