type PasswordInputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Components/Password Input",
  args: {
    autocomplete: "current-password",
    disabled: false,
    placeholder: "Enter password",
    readonly: false,
    required: false,
    value: "hunter2"
  },
  render: ({ autocomplete, disabled, placeholder, readonly, required, value }: PasswordInputStoryArgs) => `
    <emb-password-input
      autocomplete="${autocomplete}"
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
    ></emb-password-input>
  `
};

export default meta;

export const Default = {};
