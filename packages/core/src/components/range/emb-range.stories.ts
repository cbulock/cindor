type RangeStoryArgs = {
  disabled: boolean;
  label: string;
  max: number;
  min: number;
  required: boolean;
  step: number;
  value: number;
};

const meta = {
  title: "Primitives/Range",
  args: {
    disabled: false,
    label: "Volume",
    max: 100,
    min: 0,
    required: false,
    step: 5,
    value: 35
  },
  render: ({ disabled, label, max, min, required, step, value }: RangeStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <emb-range
      aria-label="${label}"
      ${disabled ? "disabled" : ""}
      max="${max}"
      min="${min}"
      ${required ? "required" : ""}
      step="${step}"
      value="${value}"
      ></emb-range>
    </div>
  `
};

export default meta;

export const Default = {};
