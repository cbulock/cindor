import { html } from "lit";

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
    <emb-dialog .modal=${modal} .open=${open} aria-label=${title}>
      <h3>${title}</h3>
      <p>${description}</p>
      <emb-button>${confirmLabel}</emb-button>
    </emb-dialog>
  `
};

export default meta;

export const Default = {};

export const NonModal = {
  args: {
    modal: false
  }
};
