import { html } from "lit";
import { expect, fn } from "storybook/test";

import type { CindorDialog } from "./cindor-dialog.js";

type DialogStoryArgs = {
  confirmLabel: string;
  description: string;
  modal: boolean;
  open: boolean;
  title: string;
};

const meta = {
  title: "Composites/Dialog",
  args: {
    confirmLabel: "Confirm",
    description: "This action removes the project shell and keeps the upstream design tokens intact.",
    modal: true,
    open: true,
    title: "Delete project"
  },
  render: ({ confirmLabel, description, modal, open, title }: DialogStoryArgs) => html`
    <cindor-dialog .modal=${modal} .open=${open} aria-label=${title}>
      <h3>${title}</h3>
      <p>${description}</p>
      <cindor-button>${confirmLabel}</cindor-button>
    </cindor-dialog>
  `
};

export default meta;

export const Default = {};

export const NonModal = {
  args: {
    modal: false
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector<CindorDialog>("cindor-dialog")!;
    host.showModal();
    await host.updateComplete;

    const dialog = host.renderRoot.querySelector("dialog")!;
    const close = fn();
    host.addEventListener("close", close);
    const internalClose = new Promise<void>((resolve) => dialog.addEventListener("close", () => resolve(), { once: true }));
    host.show();
    await host.updateComplete;
    await internalClose;
    await host.updateComplete;

    await expect(host.open).toBe(true);
    await expect(dialog.open).toBe(true);
    await expect(dialog.matches(":modal")).toBe(false);
    await expect(close).not.toHaveBeenCalled();

    const queuedClose = new Promise<void>((resolve) => dialog.addEventListener("close", () => resolve(), { once: true }));
    host.close();
    host.show();
    await host.updateComplete;
    await queuedClose;
    await host.updateComplete;
    host.removeEventListener("close", close);

    await expect(host.open).toBe(true);
    await expect(dialog.open).toBe(true);
    await expect(close).not.toHaveBeenCalled();
  }
};
