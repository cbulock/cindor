type DividerStoryArgs = {
  aboveLabel: string;
  belowLabel: string;
  width: number;
};

const meta = {
  title: "Primitives/Divider",
  args: {
    aboveLabel: "Above",
    belowLabel: "Below",
    width: 280
  },
  render: ({ aboveLabel, belowLabel, width }: DividerStoryArgs) => `
    <div style="width: ${width}px; display: grid; gap: 12px;">
      <span>${aboveLabel}</span>
      <emb-divider></emb-divider>
      <span>${belowLabel}</span>
    </div>
  `
};

export default meta;

export const Default = {};
