type UrlInputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  label: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Primitives/URL Input",
  args: {
    autocomplete: "url",
    disabled: false,
    label: "Website",
    placeholder: "https://example.com",
    readonly: false,
    required: false,
    value: "https://emberline.dev"
  },
  render: ({ autocomplete, disabled, label, placeholder, readonly, required, value }: UrlInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <emb-url-input
      aria-label="${label}"
      autocomplete="${autocomplete}"
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
      ></emb-url-input>
    </div>
  `
};

export default meta;

export const Default = {};
