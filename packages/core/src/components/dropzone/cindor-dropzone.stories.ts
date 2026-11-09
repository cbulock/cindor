import { expect, fn } from "storybook/test";

import type { CindorDropzone } from "./cindor-dropzone.js";

type DropzoneStoryArgs = {
  accept: string;
  disabled: boolean;
  label: string;
  multiple: boolean;
  required: boolean;
};

const meta = {
  title: "Composites/Dropzone",
  args: {
    accept: ".png,.jpg,.pdf",
    disabled: false,
    label: "Upload attachments",
    multiple: true,
    required: false
  },
  render: ({ accept, disabled, label, multiple, required }: DropzoneStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 520px);">
      <span>${label}</span>
      <cindor-dropzone
        aria-label="${label}"
        ${accept ? `accept="${accept}"` : ""}
        ${disabled ? "disabled" : ""}
        ${multiple ? "multiple" : ""}
        ${required ? "required" : ""}
      ></cindor-dropzone>
    </div>
  `
};

export default meta;

export const Default = {};

export const Required = {
  args: { required: true },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const dropzone = canvasElement.querySelector<CindorDropzone>("cindor-dropzone")!;
    await dropzone.updateComplete;
    const invalid = fn((event: Event) => event.preventDefault());
    dropzone.addEventListener("invalid", invalid, { once: true });
    await expect(dropzone.checkValidity()).toBe(false);
    await expect(invalid).toHaveBeenCalledTimes(1);
  }
};
