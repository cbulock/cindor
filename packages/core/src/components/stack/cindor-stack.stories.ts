type StackStoryArgs = {
  align: "start" | "center" | "end" | "stretch" | "baseline";
  direction: "vertical" | "horizontal";
  gap: "0" | "1" | "2" | "3" | "4" | "5" | "6";
  justify: "start" | "center" | "end" | "between";
  wrap: boolean;
};

const meta = {
  title: "Layout/Stack",
  args: {
    align: "center",
    direction: "horizontal",
    gap: "3",
    justify: "start",
    wrap: true
  },
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"]
    },
    direction: {
      control: "select",
      options: ["vertical", "horizontal"]
    },
    gap: {
      control: "select",
      options: ["0", "1", "2", "3", "4", "5", "6"]
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between"]
    },
    wrap: {
      control: "boolean"
    }
  },
  render: ({ align, direction, gap, justify, wrap }: StackStoryArgs) => `
    <cindor-stack
      align="${align}"
      direction="${direction}"
      gap="${gap}"
      justify="${justify}"
      ${wrap ? "wrap" : ""}
    >
      <cindor-badge tone="accent">Primary</cindor-badge>
      <cindor-badge>Secondary</cindor-badge>
      <cindor-button variant="ghost">Review</cindor-button>
      <cindor-button>Ship</cindor-button>
    </cindor-stack>
  `
};

export default meta;

export const Default = {};
