import { html } from "lit";

import type { StepperStep } from "./emb-stepper.js";

type StepperStoryArgs = {
  interactive: boolean;
  orientation: "horizontal" | "vertical";
  value: string;
};

const steps: StepperStep[] = [
  { description: "Tell us what you are building.", label: "Project details", value: "details" },
  { description: "Invite collaborators and assign roles.", label: "Team", value: "team" },
  { description: "Review settings and launch the workspace.", label: "Launch", value: "launch" }
];

const meta = {
  title: "Components/Stepper",
  args: {
    interactive: true,
    orientation: "horizontal",
    value: "team"
  },
  argTypes: {
    orientation: {
      control: { type: "inline-radio" },
      options: ["horizontal", "vertical"]
    },
    value: {
      control: { type: "radio" },
      options: ["details", "team", "launch"]
    }
  },
  render: ({ interactive, orientation, value }: StepperStoryArgs) => html`
    <emb-stepper
      aria-label="Workspace setup progress"
      .steps=${steps}
      ?interactive=${interactive}
      orientation=${orientation}
      value=${value}
    ></emb-stepper>
  `
};

export default meta;

export const Default = {};
