import "../../register.js";

import { CindorDialog } from "./cindor-dialog.js";

describe("cindor-dialog", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs open state to the internal dialog", async () => {
    const element = document.createElement("cindor-dialog") as CindorDialog;
    document.body.append(element);
    await element.updateComplete;

    element.open = true;
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog");

    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute("open")).toBe(true);
  });

  it("updates host state when the internal dialog closes", async () => {
    const element = document.createElement("cindor-dialog") as CindorDialog;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog");
    dialog!.dispatchEvent(new Event("close"));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("closes when the close button is pressed", async () => {
    const element = document.createElement("cindor-dialog") as CindorDialog;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const closeButton = element.renderRoot.querySelector('[part="close-button"]') as HTMLElement;
    closeButton.dispatchEvent(new Event("click", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("reopens in non-modal mode when modal changes while open", async () => {
    const element = document.createElement("cindor-dialog") as CindorDialog;
    document.body.append(element);
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog") as HTMLDialogElement;
    const showModalSpy = vi.fn(() => {
      dialog.setAttribute("open", "");
    });
    const showSpy = vi.fn(() => {
      dialog.setAttribute("open", "");
    });
    const closeSpy = vi.fn(() => {
      dialog.removeAttribute("open");
      dialog.dispatchEvent(new Event("close"));
    });

    Object.defineProperties(dialog, {
      close: {
        configurable: true,
        value: closeSpy
      },
      show: {
        configurable: true,
        value: showSpy
      },
      showModal: {
        configurable: true,
        value: showModalSpy
      }
    });

    element.modal = true;
    element.open = true;
    await element.updateComplete;

    element.modal = false;
    await element.updateComplete;

    expect(showModalSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(showSpy).toHaveBeenCalled();
    expect(element.open).toBe(true);
  });

  it("forwards accessible name and description to the dialog element", async () => {
    const element = document.createElement("cindor-dialog") as CindorDialog;
    element.setAttribute("aria-label", "Project settings");
    element.setAttribute("aria-description", "Review the consequences before continuing.");
    document.body.append(element);
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog");

    expect(dialog?.getAttribute("aria-label")).toBe("Project settings");
    expect(dialog?.getAttribute("aria-describedby")).toMatch(/-description$/);
    expect(element.hasAttribute("aria-label")).toBe(false);
    expect(element.hasAttribute("aria-description")).toBe(false);
  });

  it("mirrors host aria-labelledby and aria-describedby into shadow-safe dialog references", async () => {
    document.body.innerHTML = `
      <h2 id="dialog-title">Delete project</h2>
      <p id="dialog-description">This action cannot be undone.</p>
    `;

    const element = document.createElement("cindor-dialog") as CindorDialog;
    element.setAttribute("aria-labelledby", "dialog-title");
    element.setAttribute("aria-describedby", "dialog-description");
    document.body.append(element);
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog");
    const labelledById = dialog?.getAttribute("aria-labelledby");
    const describedById = dialog?.getAttribute("aria-describedby");

    expect(labelledById).toMatch(/-label$/);
    expect(describedById).toMatch(/-description$/);
    expect(element.renderRoot.querySelector(`#${labelledById ?? ""}`)?.textContent).toBe("Delete project");
    expect(element.renderRoot.querySelector(`#${describedById ?? ""}`)?.textContent).toBe("This action cannot be undone.");
    expect(element.hasAttribute("aria-labelledby")).toBe(false);
    expect(element.hasAttribute("aria-describedby")).toBe(false);
  });

  it("updates mirrored label and description text when referenced content changes", async () => {
    document.body.innerHTML = `
      <h2 id="dialog-title">Delete project</h2>
      <p id="dialog-description">This action cannot be undone.</p>
    `;

    const element = document.createElement("cindor-dialog") as CindorDialog;
    element.setAttribute("aria-labelledby", "dialog-title");
    element.setAttribute("aria-describedby", "dialog-description");
    document.body.append(element);
    await element.updateComplete;

    const title = document.getElementById("dialog-title") as HTMLElement;
    const description = document.getElementById("dialog-description") as HTMLElement;
    title.textContent = "Archive project";
    description.textContent = "You can restore it later.";
    await Promise.resolve();
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog") as HTMLDialogElement;
    const labelledById = dialog.getAttribute("aria-labelledby");
    const describedById = dialog.getAttribute("aria-describedby");

    expect(element.renderRoot.querySelector(`#${labelledById ?? ""}`)?.textContent).toBe("Archive project");
    expect(element.renderRoot.querySelector(`#${describedById ?? ""}`)?.textContent).toBe("You can restore it later.");
  });

  it("dispatches cancel events from the native dialog surface", async () => {
    const element = document.createElement("cindor-dialog") as CindorDialog;
    const cancelled = vi.fn();
    element.open = true;
    element.addEventListener("cancel", cancelled);
    document.body.append(element);
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog") as HTMLDialogElement;
    dialog.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(cancelled).toHaveBeenCalledTimes(1);
  });

  it("supports imperative show helpers and delegates focus", async () => {
    const element = document.createElement("cindor-dialog") as CindorDialog;
    document.body.append(element);
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog") as HTMLDialogElement;
    dialog.focus = vi.fn();

    element.focus();
    expect(dialog.focus).toHaveBeenCalledTimes(1);

    element.show();
    expect(element.open).toBe(true);
    expect(element.modal).toBe(false);

    element.showModal();
    expect(element.open).toBe(true);
    expect(element.modal).toBe(true);
  });
});
