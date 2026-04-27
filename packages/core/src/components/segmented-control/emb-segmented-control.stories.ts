import { html } from "lit";

import type { SegmentedControlOption } from "./emb-segmented-control.js";

type SegmentedControlStoryArgs = {
  disabled: boolean;
  value: string;
};

const options: SegmentedControlOption[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" }
];

const meta = {
  title: "Components/Segmented Control",
  args: {
    disabled: false,
    value: "week"
  },
  argTypes: {
    value: {
      control: { type: "radio" },
      options: ["day", "week", "month"]
    }
  },
  render: ({ disabled, value }: SegmentedControlStoryArgs) => html`
    <emb-segmented-control
      .options=${options}
      value=${value}
      ?disabled=${disabled}
      aria-label="Timeline granularity"
    ></emb-segmented-control>
  `
};

export default meta;

export const Default = {};
