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
    <emb-stack
      align="${align}"
      direction="${direction}"
      gap="${gap}"
      justify="${justify}"
      ${wrap ? "wrap" : ""}
    >
      <emb-badge tone="accent">Primary</emb-badge>
      <emb-badge>Secondary</emb-badge>
      <emb-button variant="ghost">Review</emb-button>
      <emb-button>Ship</emb-button>
    </emb-stack>
  `
};

export default meta;

export const Default = {};
