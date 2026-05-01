type EmailInputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  label: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Primitives/Email Input",
  args: {
    autocomplete: "email",
    disabled: false,
    label: "Email address",
    placeholder: "name@example.com",
    readonly: false,
    required: false,
    value: "hello@example.com"
  },
  render: ({ autocomplete, disabled, label, placeholder, readonly, required, value }: EmailInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <emb-email-input
      aria-label="${label}"
      autocomplete="${autocomplete}"
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
      ></emb-email-input>
    </div>
  `
};

export default meta;

export const Default = {};
