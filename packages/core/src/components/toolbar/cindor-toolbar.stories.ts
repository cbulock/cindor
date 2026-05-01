import { html } from "lit";

import type { SegmentedControlOption } from "../segmented-control/cindor-segmented-control.js";

type ToolbarStoryArgs = {
  orientation: "horizontal" | "vertical";
  wrap: boolean;
};

const alignmentOptions: SegmentedControlOption[] = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" }
];

const meta = {
  title: "Primitives/Toolbar",
  args: {
    orientation: "horizontal",
    wrap: false
  },
  argTypes: {
    orientation: {
      control: { type: "inline-radio" },
      options: ["horizontal", "vertical"]
    }
  },
  render: ({ orientation, wrap }: ToolbarStoryArgs) => html`
    <cindor-toolbar
      aria-label="Text formatting"
      orientation=${orientation}
      ?wrap=${wrap}
    >
      <cindor-button-group attached>
        <cindor-button variant="ghost">Bold</cindor-button>
        <cindor-button variant="ghost">Italic</cindor-button>
        <cindor-button variant="ghost">Underline</cindor-button>
      </cindor-button-group>
      <cindor-segmented-control
        .options=${alignmentOptions}
        aria-label="Text alignment"
        value="left"
      ></cindor-segmented-control>
      <cindor-icon-button label="More actions" name="ellipsis"></cindor-icon-button>
    </cindor-toolbar>
  `
};

export default meta;

export const Default = {};
