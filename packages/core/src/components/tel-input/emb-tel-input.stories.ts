type TelInputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  label: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Primitives/Tel Input",
  args: {
    autocomplete: "tel",
    disabled: false,
    label: "Phone number",
    placeholder: "(555) 010-0000",
    readonly: false,
    required: false,
    value: "(555) 010-0000"
  },
  render: ({ autocomplete, disabled, label, placeholder, readonly, required, value }: TelInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span id="tel-input-story-label">${label}</span>
      <emb-tel-input
      aria-labelledby="tel-input-story-label"
      autocomplete="${autocomplete}"
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
      ></emb-tel-input>
    </div>
  `
};

export default meta;

export const Default = {};
