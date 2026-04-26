type NumberInputStoryArgs = {
  disabled: boolean;
  max: string;
  min: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  step: string;
  value: string;
};

const meta = {
  title: "Components/Number Input",
  args: {
    disabled: false,
    max: "10",
    min: "0",
    placeholder: "Quantity",
    readonly: false,
    required: false,
    step: "1",
    value: "3"
  },
  render: ({ disabled, max, min, placeholder, readonly, required, step, value }: NumberInputStoryArgs) => `
    <emb-number-input
      ${disabled ? "disabled" : ""}
      ${max ? `max="${max}"` : ""}
      ${min ? `min="${min}"` : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      ${step ? `step="${step}"` : ""}
      value="${value}"
    ></emb-number-input>
  `
};

export default meta;

export const Default = {};
