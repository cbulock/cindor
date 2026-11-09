import "../../register.js";

import type { CindorMenuItem } from "../menu-item/cindor-menu-item.js";
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

    const menuTrigger = element.renderRoot.querySelector('.menu-shell cindor-button');

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

    const menuTrigger = element.renderRoot.querySelector(".menu-shell cindor-button");
    const menu = element.renderRoot.querySelector('[part="menu"]');

    expect(menuTrigger?.getAttribute("aria-haspopup")).toBe("menu");
    expect(menuTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(menuTrigger?.getAttribute("aria-controls")).toBe(menu?.id);
  });

  it("renders the menu trigger without summary or details wrappers", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    element.innerHTML = `
      Publish
      <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector(".menu-shell cindor-button")).not.toBeNull();
    expect(element.renderRoot.querySelector("summary")).toBeNull();
    expect(element.renderRoot.querySelector("details")).toBeNull();
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

  it("reserves bubbling click for the primary action", async () => {
    const element = document.createElement("cindor-split-button") as CindorSplitButton;
    const menuItem = document.createElement("cindor-menu-item") as CindorMenuItem;
    menuItem.slot = "menu";
    menuItem.textContent = "Save draft";
    element.append("Publish", menuItem);
    document.body.append(element);
    await element.updateComplete;
    await menuItem.updateComplete;

    const click = vi.fn();
    const capture = vi.fn();
    const select = vi.fn();
    element.addEventListener("click", click);
    element.addEventListener("click", capture, true);
    element.addEventListener("menu-item-select", select);

    const trigger = element.renderRoot.querySelector<HTMLElement>(".menu-shell cindor-button")!;
    trigger.click();
    expect(element.open).toBe(true);
    await element.updateComplete;
    menuItem.click();
    expect(element.open).toBe(false);
    expect(select).toHaveBeenCalledTimes(1);
    expect(click).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledTimes(2);

    element.click();
    expect(click).toHaveBeenCalledExactlyOnceWith(expect.any(MouseEvent));
    expect(capture).toHaveBeenLastCalledWith(click.mock.calls[0][0]);
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

    const menuTrigger = element.renderRoot.querySelector(".menu-shell cindor-button") as HTMLElement;
    menuTrigger.click();
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
    const menuTrigger = element.renderRoot.querySelector(".menu-shell cindor-button") as HTMLElement;
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
