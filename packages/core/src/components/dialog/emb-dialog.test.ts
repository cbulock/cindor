import "../../register.js";

import { EmbDialog } from "./emb-dialog.js";

describe("emb-dialog", () => {
  it("syncs open state to the internal dialog", async () => {
    const element = document.createElement("emb-dialog") as EmbDialog;
    document.body.append(element);
    await element.updateComplete;

    element.open = true;
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog");

    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute("open")).toBe(true);
  });

  it("updates host state when the internal dialog closes", async () => {
    const element = document.createElement("emb-dialog") as EmbDialog;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const dialog = element.renderRoot.querySelector("dialog");
    dialog!.dispatchEvent(new Event("close"));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("closes when the close button is pressed", async () => {
    const element = document.createElement("emb-dialog") as EmbDialog;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const closeButton = element.renderRoot.querySelector('[part="close-button"]') as HTMLButtonElement;
    closeButton.click();
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("reopens in non-modal mode when modal changes while open", async () => {
    const element = document.createElement("emb-dialog") as EmbDialog;
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
});
