import { html } from "lit";

import type { SegmentedControlOption } from "../segmented-control/emb-segmented-control.js";

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
    <emb-toolbar
      aria-label="Text formatting"
      orientation=${orientation}
      ?wrap=${wrap}
    >
      <emb-button-group attached>
        <emb-button variant="ghost">Bold</emb-button>
        <emb-button variant="ghost">Italic</emb-button>
        <emb-button variant="ghost">Underline</emb-button>
      </emb-button-group>
      <emb-segmented-control
        .options=${alignmentOptions}
        aria-label="Text alignment"
        value="left"
      ></emb-segmented-control>
      <emb-icon-button label="More actions" name="ellipsis"></emb-icon-button>
    </emb-toolbar>
  `
};

export default meta;

export const Default = {};
