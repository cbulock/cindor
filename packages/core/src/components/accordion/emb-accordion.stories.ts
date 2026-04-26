type AccordionStoryArgs = {
  content: string;
  open: boolean;
  summary: string;
};

const meta = {
  title: "Components/Accordion",
  args: {
    content: "Keep the upstream Emberline theme available through the shared global stylesheet.",
    open: false,
    summary: "Deployment settings"
  },
  render: ({ content, open, summary }: AccordionStoryArgs) => `
    <emb-accordion ${open ? "open" : ""}>
      <span slot="summary">${summary}</span>
      <p>${content}</p>
    </emb-accordion>
  `
};

export default meta;

export const Default = {};

export const Open = {
  args: {
    open: true
  }
};
