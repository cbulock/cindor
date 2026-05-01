type SearchStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  label: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Primitives/Search",
  args: {
    autocomplete: "",
    disabled: false,
    label: "Search docs",
    placeholder: "Search components",
    readonly: false,
    required: false,
    value: "button"
  },
  render: ({ autocomplete, disabled, label, placeholder, readonly, required, value }: SearchStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <cindor-search
      aria-label="${label}"
      ${autocomplete ? `autocomplete="${autocomplete}"` : ""}
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
      ></cindor-search>
    </div>
  `
};

export default meta;

export const Default = {};
