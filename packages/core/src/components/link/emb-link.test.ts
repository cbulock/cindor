import "../../register.js";

import { EmbLink } from "./emb-link.js";

describe("emb-link", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs host href to the native anchor element", async () => {
    const element = document.createElement("emb-link") as EmbLink;
    element.href = "/docs";
    element.textContent = "Docs";
    document.body.append(element);
    await element.updateComplete;

    const anchor = element.renderRoot.querySelector("a");

    expect(anchor?.getAttribute("href")).toBe("/docs");
  });

  it("defaults to a safe rel for new tabs and respects explicit rel values", async () => {
    const element = document.createElement("emb-link") as EmbLink;
    element.href = "https://emberline.dev";
    element.target = "_blank";
    document.body.append(element);
    await element.updateComplete;

    const anchor = element.renderRoot.querySelector("a") as HTMLAnchorElement;
    expect(anchor.rel).toBe("noreferrer noopener");

    element.rel = "external";
    await element.updateComplete;
    expect(anchor.rel).toBe("external");
  });

  it("delegates click and focus to the native anchor and forwards download", async () => {
    const element = document.createElement("emb-link") as EmbLink;
    element.href = "/download";
    element.download = "report.txt";
    document.body.append(element);
    await element.updateComplete;

    const anchor = element.renderRoot.querySelector("a") as HTMLAnchorElement;
    anchor.click = vi.fn();
    anchor.focus = vi.fn();

    element.click();
    element.focus();

    expect(anchor.getAttribute("download")).toBe("report.txt");
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(anchor.focus).toHaveBeenCalledTimes(1);
  });
});
