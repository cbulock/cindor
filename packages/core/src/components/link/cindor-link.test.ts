import "../../register.js";

import { CindorLink } from "./cindor-link.js";

describe("cindor-link", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs host href to the native anchor element", async () => {
    const element = document.createElement("cindor-link") as CindorLink;
    element.href = "/docs";
    element.textContent = "Docs";
    document.body.append(element);
    await element.updateComplete;

    const anchor = element.renderRoot.querySelector("a");

    expect(anchor?.getAttribute("href")).toBe("/docs");
  });

  it("does not render a fallback href when the host href is missing", async () => {
    const element = document.createElement("cindor-link") as CindorLink;
    element.textContent = "Docs";
    document.body.append(element);
    await element.updateComplete;

    const anchor = element.renderRoot.querySelector("a");

    expect(anchor?.hasAttribute("href")).toBe(false);
  });

  it("defaults to a safe rel for new tabs and respects explicit rel values", async () => {
    const element = document.createElement("cindor-link") as CindorLink;
    element.href = "https://cindor.dev";
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
    const element = document.createElement("cindor-link") as CindorLink;
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

  it("forwards host accessibility attributes to the native anchor", async () => {
    const element = document.createElement("cindor-link") as CindorLink;
    element.href = "/docs";
    element.textContent = "Docs";
    element.setAttribute("aria-label", "Documentation");
    element.setAttribute("aria-describedby", "docs-help");
    document.body.append(element);
    await element.updateComplete;

    const anchor = element.renderRoot.querySelector("a") as HTMLAnchorElement;
    expect(anchor.getAttribute("aria-label")).toBe("Documentation");
    expect(anchor.getAttribute("aria-describedby")).toBe("docs-help");

    element.setAttribute("aria-labelledby", "docs-label");
    element.removeAttribute("aria-label");
    await Promise.resolve();
    await element.updateComplete;

    expect(anchor.hasAttribute("aria-label")).toBe(false);
    expect(anchor.getAttribute("aria-labelledby")).toBe("docs-label");
  });

  it("enables focus delegation on the shadow root", () => {
    expect(CindorLink.shadowRootOptions.delegatesFocus).toBe(true);
  });
});
