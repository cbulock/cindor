type TimeInputStoryArgs = {
  disabled: boolean;
  label: string;
  max: string;
  min: string;
  readonly: boolean;
  required: boolean;
  step: string;
  value: string;
};

const meta = {
  title: "Primitives/Time Input",
  args: {
    disabled: false,
    label: "Meeting time",
    max: "",
    min: "",
    readonly: false,
    required: false,
    step: "900",
    value: "13:45"
  },
  render: ({ disabled, label, max, min, readonly, required, step, value }: TimeInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <cindor-time-input
      aria-label="${label}"
      ${disabled ? "disabled" : ""}
      ${max ? `max="${max}"` : ""}
      ${min ? `min="${min}"` : ""}
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      ${step ? `step="${step}"` : ""}
      value="${value}"
      ></cindor-time-input>
    </div>
  `
};

export default meta;

export const Default = {};
