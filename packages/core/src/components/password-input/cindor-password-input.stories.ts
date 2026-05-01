type PasswordInputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  label: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Primitives/Password Input",
  args: {
    autocomplete: "current-password",
    disabled: false,
    label: "Password",
    placeholder: "Enter password",
    readonly: false,
    required: false,
    value: "hunter2"
  },
  render: ({ autocomplete, disabled, label, placeholder, readonly, required, value }: PasswordInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <cindor-password-input
      aria-label="${label}"
      autocomplete="${autocomplete}"
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
      ></cindor-password-input>
    </div>
  `
};

export default meta;

export const Default = {};
