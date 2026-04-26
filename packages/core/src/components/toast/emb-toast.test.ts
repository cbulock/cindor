import "../../register.js";

import { EmbToast } from "./emb-toast.js";

describe("emb-toast", () => {
  it("hides itself after close is called", async () => {
    const element = document.createElement("emb-toast") as EmbToast;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    element.close();
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(element.renderRoot.querySelector('[part="surface"]')).toBeNull();
  });

  it("renders a Lucide close icon when dismissible", async () => {
    const element = document.createElement("emb-toast") as EmbToast;
    element.dismissible = true;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="close-icon"]')).not.toBeNull();
  });
});
