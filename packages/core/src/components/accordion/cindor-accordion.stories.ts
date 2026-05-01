type AccordionStoryArgs = {
  content: string;
  open: boolean;
  summary: string;
};

const meta = {
  title: "Components/Accordion",
  args: {
    content: "Keep the upstream Cindor theme available through the shared global stylesheet.",
    open: false,
    summary: "Deployment settings"
  },
  render: ({ content, open, summary }: AccordionStoryArgs) => `
    <cindor-accordion ${open ? "open" : ""}>
      <span slot="summary">${summary}</span>
      <p>${content}</p>
    </cindor-accordion>
  `
};

export default meta;

export const Default = {};

export const Open = {
  args: {
    open: true
  }
};
