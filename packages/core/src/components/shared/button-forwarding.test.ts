import "../../register.js";
import type { LitElement } from "lit";

async function nativeButton(host: LitElement): Promise<HTMLButtonElement> {
  await Promise.resolve();
  await host.updateComplete;
  const inner = host.shadowRoot!.querySelector<LitElement>("cindor-button");
  if (inner) {
    await Promise.resolve();
    await inner.updateComplete;
  }
  return (inner?.shadowRoot ?? host.shadowRoot)!.querySelector("button")!;
}

describe.each(["cindor-button", "cindor-icon-button", "cindor-split-button"])("%s forwarding", (tag) => {
  it.each([
    ["aria-pressed", "mixed"], ["aria-busy", "true"], ["aria-disabled", "false"],
    ["aria-current", "page"], ["aria-keyshortcuts", "Alt+S"], ["aria-roledescription", "action"],
    ["aria-controls", "panel"], ["aria-expanded", "false"], ["aria-haspopup", "menu"]
  ])("synchronizes %s initially, after changes, removal and reconnect", async (attribute, value) => {
    const host = document.createElement(tag) as LitElement;
    host.setAttribute(attribute, value);
    document.body.append(host);
    const button = await nativeButton(host);
    expect(button.getAttribute(attribute)).toBe(value);
    for (const next of ["true", "false", "mixed"]) {
      host.setAttribute(attribute, next);
      await nativeButton(host);
      expect(button.getAttribute(attribute)).toBe(next);
    }
    host.removeAttribute(attribute);
    await nativeButton(host);
    expect(button.hasAttribute(attribute)).toBe(false);
    host.remove();
    const requestUpdate = vi.spyOn(host, "requestUpdate");
    host.setAttribute(attribute, value);
    await Promise.resolve();
    expect(requestUpdate).not.toHaveBeenCalled();
    expect(button.hasAttribute(attribute)).toBe(false);
    requestUpdate.mockRestore();
    document.body.append(host);
    await nativeButton(host);
    expect(button.getAttribute(attribute)).toBe(value);
    host.remove();
  });

  it.each(["click", "keydown", "keyup", "pointerdown", "pointerup", "mousedown", "mouseup", "focus", "blur", "contextmenu"])(
    "delivers native %s once with cancellation and listener removal", async (type) => {
      const host = document.createElement(tag) as LitElement;
      document.body.append(host);
      const button = await nativeButton(host);
      const listener = vi.fn((event: Event) => event.preventDefault());
      const capture = vi.fn();
      host.addEventListener(type, listener);
      host.addEventListener(type, capture, true);
      const event = new Event(type, { bubbles: !["focus", "blur"].includes(type), composed: true, cancelable: true });
      expect(button.dispatchEvent(event)).toBe(false);
      expect(listener).toHaveBeenCalledExactlyOnceWith(event);
      expect(capture).toHaveBeenCalledExactlyOnceWith(event);
      host.removeEventListener(type, listener);
      button.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
      expect(listener).toHaveBeenCalledTimes(1);
      host.remove();
    }
  );

  it("preserves disabled activation and delegated focus/click", async () => {
    const host = document.createElement(tag) as LitElement & { disabled: boolean };
    document.body.append(host);
    const button = await nativeButton(host);
    const listener = vi.fn();
    host.addEventListener("click", listener);
    host.focus();
    expect(button.getRootNode() instanceof ShadowRoot).toBe(true);
    expect((button.getRootNode() as ShadowRoot).activeElement).toBe(button);
    host.click();
    expect(listener).toHaveBeenCalledTimes(1);
    host.disabled = true;
    await nativeButton(host);
    host.click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
    host.remove();
  });
});

describe("button accessibility ownership", () => {
  it("keeps split primary state separate from menu naming and trigger state", async () => {
    const host = document.createElement("cindor-split-button") as LitElement;
    host.setAttribute("aria-label", "Publish actions");
    host.setAttribute("aria-pressed", "mixed");
    host.setAttribute("aria-expanded", "true");
    host.setAttribute("aria-controls", "primary-panel");
    document.body.append(host);
    const primary = await nativeButton(host);
    const triggerHost = host.shadowRoot!.querySelector<LitElement>(".menu-shell cindor-button")!;
    const trigger = await nativeButton(triggerHost);
    const menu = host.shadowRoot!.querySelector("cindor-menu")!;
    expect(primary.getAttribute("aria-pressed")).toBe("mixed");
    expect(primary.hasAttribute("aria-label")).toBe(false);
    expect(menu.getAttribute("aria-label")).toBe("Publish actions");
    expect(trigger.getAttribute("aria-label")).toBe("More actions");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.hasAttribute("aria-pressed")).toBe(false);
    host.setAttribute("aria-label", "Updated actions");
    await nativeButton(host);
    expect(menu.getAttribute("aria-label")).toBe("Updated actions");
    host.removeAttribute("aria-label");
    await nativeButton(host);
    expect(menu.hasAttribute("aria-label")).toBe(false);
    host.remove();
  });

  it("preserves icon label precedence and live external description mirrors", async () => {
    const help = document.createElement("span");
    help.id = "forwarding-help";
    help.textContent = "Initial help";
    document.body.append(help);
    const host = document.createElement("cindor-icon-button") as LitElement & { label: string };
    host.label = "Explicit label";
    host.setAttribute("aria-label", "Host label");
    host.setAttribute("aria-describedby", help.id);
    document.body.append(host);
    const button = await nativeButton(host);
    expect(button.getAttribute("aria-label")).toBe("Explicit label");
    const control = host.shadowRoot!.querySelector("cindor-button")!;
    const description = () => control.shadowRoot!.getElementById(button.getAttribute("aria-describedby")!)?.textContent;
    expect(description()).toBe("Initial help");
    help.textContent = "Updated help";
    await nativeButton(host);
    expect(description()).toBe("Updated help");
    host.label = "";
    host.removeAttribute("aria-describedby");
    await nativeButton(host);
    expect(button.getAttribute("aria-label")).toBe("Host label");
    expect(button.hasAttribute("aria-describedby")).toBe(false);
    host.remove();
    help.remove();
  });
});
