type ProgressStoryArgs = {
  label: string;
  max: number;
  value: number;
};

const meta = {
  title: "Components/Progress",
  args: {
    label: "Upload progress",
    max: 100,
    value: 64
  },
  render: ({ label, max, value }: ProgressStoryArgs) => `<emb-progress value="${value}" max="${max}">${label}</emb-progress>`
};

export default meta;

export const Default = {};
