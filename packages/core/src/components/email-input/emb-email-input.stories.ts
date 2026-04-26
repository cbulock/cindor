type EmailInputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Components/Email Input",
  args: {
    autocomplete: "email",
    disabled: false,
    placeholder: "name@example.com",
    readonly: false,
    required: false,
    value: "hello@example.com"
  },
  render: ({ autocomplete, disabled, placeholder, readonly, required, value }: EmailInputStoryArgs) => `
    <emb-email-input
      autocomplete="${autocomplete}"
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
    ></emb-email-input>
  `
};

export default meta;

export const Default = {};
