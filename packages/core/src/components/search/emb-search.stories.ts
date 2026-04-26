type SearchStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Components/Search",
  args: {
    autocomplete: "",
    disabled: false,
    placeholder: "Search components",
    readonly: false,
    required: false,
    value: "button"
  },
  render: ({ autocomplete, disabled, placeholder, readonly, required, value }: SearchStoryArgs) => `
    <emb-search
      ${autocomplete ? `autocomplete="${autocomplete}"` : ""}
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
    ></emb-search>
  `
};

export default meta;

export const Default = {};
