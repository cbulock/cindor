import "../../register.js";

import { CindorSplitButton } from "./cindor-split-button.js";

describe("cindor-split-button", () => {
  it("renders a primary button, menu trigger, and secondary menu surface", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    element.innerHTML = `
      <cindor-icon slot="start-icon" name="rocket"></cindor-icon>
      Publish
      <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const buttons = element.renderRoot.querySelectorAll("cindor-button");
    const menu = element.renderRoot.querySelector('[part="menu"]');

    expect(buttons).toHaveLength(2);
    expect(menu).not.toBeNull();
    expect(element.textContent).toContain("Publish");
  });

  it("uses the configured menu trigger label", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    element.menuLabel = "More publish actions";
    element.textContent = "Publish";
    document.body.append(element);
    await element.updateComplete;

    const menuTrigger = element.renderRoot.querySelector('summary cindor-button');

    expect(menuTrigger?.getAttribute("aria-label")).toBe("More publish actions");
  });

  it("connects the menu trigger to the internal menu state", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    element.open = true;
    element.innerHTML = `
      Publish
      <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const menuTrigger = element.renderRoot.querySelector("summary cindor-button");
    const menu = element.renderRoot.querySelector('[part="menu"]');

    expect(menuTrigger?.getAttribute("aria-haspopup")).toBe("menu");
    expect(menuTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(menuTrigger?.getAttribute("aria-controls")).toBe(menu?.id);
  });

  it("forwards host accessible naming to the internal menu", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    element.open = true;
    element.setAttribute("aria-label", "Publish actions");
    element.innerHTML = `
      Publish
      <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="menu"]')?.getAttribute("aria-label")).toBe("Publish actions");
  });

  it("closes when a secondary menu item is selected", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    element.open = true;
    element.innerHTML = `
      Publish
      <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const menuItem = element.querySelector('cindor-menu-item[slot="menu"]') as HTMLElement;
    menuItem.click();
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("prevents opening the menu when disabled", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    element.disabled = true;
    element.innerHTML = `
      Publish
      <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const summary = element.renderRoot.querySelector("summary") as HTMLElement;
    summary.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("closes on Escape and restores focus to the menu trigger", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    element.open = true;
    element.innerHTML = `
      Publish
      <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const menu = element.renderRoot.querySelector('[part="menu"]') as HTMLElement;
    const menuTrigger = element.renderRoot.querySelector("summary cindor-button") as HTMLElement;
    menu.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Escape" }));
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect((element.renderRoot as ShadowRoot).activeElement).toBe(menuTrigger);
  });

  it("submits its owning form when configured as a submit button", async () => {
    document.body.innerHTML = `
      <form>
        <cindor-split-button type="submit">
          Publish
          <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
        </cindor-split-button>
      </form>
    `;

    const form = document.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const element = document.querySelector("cindor-split-button") as CindorSplitButton;
    await element.updateComplete;

    const primaryButton = element.renderRoot.querySelector("cindor-button.primary") as HTMLElement;
    primaryButton.click();

    expect(primaryButton.getAttribute("form")).toBe(form.id);
    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });
});
