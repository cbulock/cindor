import { html } from "lit";

import type { CindorToastRegion } from "./cindor-toast-region.js";

type ToastRegionStoryArgs = {
  firstTone: "neutral" | "success" | "warning" | "danger";
  placement: "top-start" | "top-end" | "bottom-start" | "bottom-end";
  secondTone: "neutral" | "success" | "warning" | "danger";
};

const meta = {
  title: "Composites/Toast Region",
  args: {
    firstTone: "success",
    placement: "top-end",
    secondTone: "warning"
  },
  argTypes: {
    firstTone: {
      control: "radio",
      options: ["neutral", "success", "warning", "danger"]
    },
    placement: {
      control: "radio",
      options: ["top-start", "top-end", "bottom-start", "bottom-end"]
    },
    secondTone: {
      control: "radio",
      options: ["neutral", "success", "warning", "danger"]
    }
  },
  render: ({ firstTone, placement, secondTone }: ToastRegionStoryArgs) => {
    const showToast = (event: Event, tone: ToastRegionStoryArgs["firstTone"], message: string, id?: string) => {
      const region = (event.currentTarget as HTMLElement)
        .closest("[data-toast-demo]")
        ?.querySelector("cindor-toast-region") as CindorToastRegion | null;

      region?.showToast({
        content: message,
        duration: 0,
        id,
        tone
      });
    };

    return html`
      <div data-toast-demo style="min-height: 16rem; position: relative; display: grid; gap: var(--space-3); align-content: start;">
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
          <cindor-button @click=${(event: Event) => showToast(event, firstTone, "Changes saved to the design token layer.", "toast-demo-primary")}>
            Show primary toast
          </cindor-button>
          <cindor-button
            variant="ghost"
            @click=${(event: Event) => showToast(event, secondTone, "Theme settings were updated successfully.", "toast-demo-secondary")}
          >
            Show secondary toast
          </cindor-button>
          <cindor-button
            variant="ghost"
            @click=${(event: Event) => showToast(event, "warning", "Publishing state updated in place.", "toast-demo-primary")}
          >
            Update existing toast
          </cindor-button>
        </div>
        <cindor-toast-region placement=${placement}></cindor-toast-region>
      </div>
    `;
  }
};

export default meta;

export const Default = {};
