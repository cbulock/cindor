type TimeInputStoryArgs = {
  disabled: boolean;
  max: string;
  min: string;
  readonly: boolean;
  required: boolean;
  step: string;
  value: string;
};

const meta = {
  title: "Components/Time Input",
  args: {
    disabled: false,
    max: "",
    min: "",
    readonly: false,
    required: false,
    step: "900",
    value: "13:45"
  },
  render: ({ disabled, max, min, readonly, required, step, value }: TimeInputStoryArgs) => `
    <emb-time-input
      ${disabled ? "disabled" : ""}
      ${max ? `max="${max}"` : ""}
      ${min ? `min="${min}"` : ""}
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      ${step ? `step="${step}"` : ""}
      value="${value}"
    ></emb-time-input>
  `
};

export default meta;

export const Default = {};
