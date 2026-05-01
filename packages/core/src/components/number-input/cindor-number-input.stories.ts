type NumberInputStoryArgs = {
  disabled: boolean;
  label: string;
  max: string;
  min: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  step: string;
  value: string;
};

const meta = {
  title: "Primitives/Number Input",
  args: {
    disabled: false,
    label: "Quantity",
    max: "10",
    min: "0",
    placeholder: "Quantity",
    readonly: false,
    required: false,
    step: "1",
    value: "3"
  },
  render: ({ disabled, label, max, min, placeholder, readonly, required, step, value }: NumberInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <cindor-number-input
      aria-label="${label}"
      ${disabled ? "disabled" : ""}
      ${max ? `max="${max}"` : ""}
      ${min ? `min="${min}"` : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      ${step ? `step="${step}"` : ""}
      value="${value}"
      ></cindor-number-input>
    </div>
  `
};

export default meta;

export const Default = {};
