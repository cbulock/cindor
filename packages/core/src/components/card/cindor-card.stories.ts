type CardStoryArgs = {
  body: string;
  heading: string;
};

const meta = {
  title: "Components/Card",
  args: {
    body: "All checks are aligned to Cindor tokens and native platform primitives.",
    heading: "Pipeline status"
  },
  render: ({ body, heading }: CardStoryArgs) => `
    <cindor-card>
      <h4>${heading}</h4>
      <p>${body}</p>
    </cindor-card>
  `
};

export default meta;

export const Default = {};
