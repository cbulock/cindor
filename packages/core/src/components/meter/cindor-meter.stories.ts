type MeterStoryArgs = {
  high: number;
  label: string;
  low: number;
  max: number;
  min: number;
  optimum: number;
  value: number;
};

const meta = {
  title: "Components/Meter",
  args: {
    high: 80,
    label: "System health",
    low: 30,
    max: 100,
    min: 0,
    optimum: 90,
    value: 72
  },
  render: ({ high, label, low, max, min, optimum, value }: MeterStoryArgs) =>
    `<cindor-meter value="${value}" min="${min}" low="${low}" high="${high}" max="${max}" optimum="${optimum}">${label}</cindor-meter>`
};

export default meta;

export const Default = {};
