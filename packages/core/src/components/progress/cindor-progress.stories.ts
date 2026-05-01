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
  render: ({ label, max, value }: ProgressStoryArgs) => `<cindor-progress value="${value}" max="${max}">${label}</cindor-progress>`
};

export default meta;

export const Default = {};
