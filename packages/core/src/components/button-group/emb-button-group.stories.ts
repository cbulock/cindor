type ButtonGroupStoryArgs = {
  attached: boolean;
  orientation: "horizontal" | "vertical";
};

const meta = {
  title: "Primitives/Button Group",
  args: {
    attached: false,
    orientation: "horizontal"
  },
  argTypes: {
    orientation: {
      control: { type: "inline-radio" },
      options: ["horizontal", "vertical"]
    }
  },
  render: ({ attached, orientation }: ButtonGroupStoryArgs) => `
    <emb-button-group
      aria-label="Example actions"
      ${attached ? "attached" : ""}
      orientation="${orientation}"
    >
      <emb-button variant="ghost">Back</emb-button>
      <emb-button>Save</emb-button>
      <emb-icon-button label="More actions" name="ellipsis"></emb-icon-button>
    </emb-button-group>
  `
};

export default meta;

export const Default = {};

export const Attached = {
  args: {
    attached: true
  }
};
