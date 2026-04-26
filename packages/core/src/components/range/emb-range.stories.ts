type RangeStoryArgs = {
  disabled: boolean;
  max: number;
  min: number;
  required: boolean;
  step: number;
  value: number;
};

const meta = {
  title: "Components/Range",
  args: {
    disabled: false,
    max: 100,
    min: 0,
    required: false,
    step: 5,
    value: 35
  },
  render: ({ disabled, max, min, required, step, value }: RangeStoryArgs) => `
    <emb-range
      ${disabled ? "disabled" : ""}
      max="${max}"
      min="${min}"
      ${required ? "required" : ""}
      step="${step}"
      value="${value}"
    ></emb-range>
  `
};

export default meta;

export const Default = {};
