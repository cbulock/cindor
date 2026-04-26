type EmptyStateStoryArgs = {
  actionLabel: string;
  description: string;
  media: string;
  title: string;
};

const meta = {
  title: "Components/Empty State",
  args: {
    actionLabel: "Create component",
    description: "Create your first component to get started.",
    media: "+",
    title: "No components yet"
  },
  render: ({ actionLabel, description, media, title }: EmptyStateStoryArgs) => `
    <emb-empty-state>
      <span slot="media">${media}</span>
      <div>
        <h3 style="margin:0 0 0.5rem;">${title}</h3>
        <p style="margin:0;">${description}</p>
      </div>
      <emb-button slot="actions">${actionLabel}</emb-button>
    </emb-empty-state>
  `
};

export default meta;

export const Default = {};
