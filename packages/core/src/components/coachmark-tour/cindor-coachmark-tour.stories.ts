import { html } from "lit";

import type { CoachmarkTourStep } from "./cindor-coachmark-tour.js";

type CoachmarkTourStoryArgs = {
  currentStep: number;
  open: boolean;
};

const steps: CoachmarkTourStep[] = [
  {
    description: "Start with the filter bar so the workspace only shows the rows you care about.",
    target: "#coachmark-tour-filters",
    title: "Refine the list"
  },
  {
    description: "Use the activity stream to confirm when teammates change status, ownership, or due dates.",
    placement: "left",
    target: "#coachmark-tour-activity",
    title: "Track recent changes"
  },
  {
    description: "The inspector is where you can edit metadata without leaving the current page context.",
    placement: "left-start",
    target: "#coachmark-tour-inspector",
    title: "Update details inline"
  }
];

const meta = {
  title: "Components/Coachmark Tour",
  args: {
    currentStep: 0,
    open: true
  },
  render: ({ currentStep, open }: CoachmarkTourStoryArgs) => html`
    <div
      style="
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(16rem, 20rem);
        gap: var(--space-6);
        min-height: 28rem;
        padding: var(--space-6);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        background: color-mix(in srgb, var(--surface) 88%, white);
      "
    >
      <section style="display: grid; gap: var(--space-4); align-content: start;">
        <header id="coachmark-tour-filters" style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
          <cindor-badge tone="accent">Assigned to me</cindor-badge>
          <cindor-badge>High priority</cindor-badge>
          <cindor-badge>Needs review</cindor-badge>
        </header>

        <cindor-card id="coachmark-tour-activity" style="padding: var(--space-4);">
          <strong style="display: block; margin-bottom: var(--space-2);">Recent activity</strong>
          <p style="margin: 0; color: var(--fg-muted);">
            Sofia moved billing QA to done and reassigned the release checklist to platform.
          </p>
        </cindor-card>
      </section>

      <cindor-card id="coachmark-tour-inspector" style="padding: var(--space-4); align-self: start;">
        <strong style="display: block; margin-bottom: var(--space-2);">Issue inspector</strong>
        <p style="margin: 0; color: var(--fg-muted);">Priority, owner, sprint, and due date live here.</p>
      </cindor-card>
    </div>

    <cindor-coachmark-tour
      .currentStep=${currentStep}
      .steps=${steps}
      ?open=${open}
    ></cindor-coachmark-tour>
  `
};

export default meta;

export const Default = {};
