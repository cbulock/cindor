type CardStoryArgs = {
  body: string;
  heading: string;
};

const meta = {
  title: "Components/Card",
  args: {
    body: "All checks are aligned to Emberline tokens and native platform primitives.",
    heading: "Pipeline status"
  },
  render: ({ body, heading }: CardStoryArgs) => `
    <emb-card>
      <h4>${heading}</h4>
      <p>${body}</p>
    </emb-card>
  `
};

export default meta;

export const Default = {};
