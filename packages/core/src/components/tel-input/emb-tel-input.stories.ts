type TelInputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Components/Tel Input",
  args: {
    autocomplete: "tel",
    disabled: false,
    placeholder: "(555) 010-0000",
    readonly: false,
    required: false,
    value: "(555) 010-0000"
  },
  render: ({ autocomplete, disabled, placeholder, readonly, required, value }: TelInputStoryArgs) => `
    <emb-tel-input
      autocomplete="${autocomplete}"
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
    ></emb-tel-input>
  `
};

export default meta;

export const Default = {};
