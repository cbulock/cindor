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
    <cindor-button-group
      aria-label="Example actions"
      ${attached ? "attached" : ""}
      orientation="${orientation}"
    >
      <cindor-button variant="ghost">Back</cindor-button>
      <cindor-button>Save</cindor-button>
      <cindor-icon-button label="More actions" name="ellipsis"></cindor-icon-button>
    </cindor-button-group>
  `
};

export default meta;

export const Default = {};

export const Attached = {
  args: {
    attached: true
  }
};
