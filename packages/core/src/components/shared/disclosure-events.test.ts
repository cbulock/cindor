import type { LitElement } from "lit";

describe.each(["cindor-accordion", "cindor-dropdown-menu", "cindor-popover"])("%s toggle ownership", (tag) => {
  it("publishes its own toggle after synchronizing open", async () => {
    const host = document.createElement(tag) as LitElement & { open: boolean };
    document.body.append(host);
    await host.updateComplete;

    const toggle = vi.fn(() => host.open);
    host.addEventListener("toggle", toggle);
    const details = host.renderRoot.querySelector("details")!;
    details.open = true;
    await new Promise<void>((resolve) => details.addEventListener("toggle", () => resolve(), { once: true }));

    expect(toggle).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: host, bubbles: true, composed: true }));
    expect(toggle).toHaveReturnedWith(true);
  });

  it("lets a slotted disclosure's toggle bubble with its original target", async () => {
    const outer = document.createElement(tag);
    const inner = document.createElement("cindor-accordion") as LitElement;
    outer.append(inner);
    document.body.append(outer);
    await inner.updateComplete;

    const toggle = vi.fn();
    outer.addEventListener("toggle", toggle);
    const details = inner.renderRoot.querySelector("details")!;
    details.open = true;
    await new Promise<void>((resolve) => details.addEventListener("toggle", () => resolve(), { once: true }));

    expect(toggle).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: inner }));
  });
});
