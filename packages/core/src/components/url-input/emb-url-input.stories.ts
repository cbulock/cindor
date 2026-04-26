type UrlInputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Components/URL Input",
  args: {
    autocomplete: "url",
    disabled: false,
    placeholder: "https://example.com",
    readonly: false,
    required: false,
    value: "https://emberline.dev"
  },
  render: ({ autocomplete, disabled, placeholder, readonly, required, value }: UrlInputStoryArgs) => `
    <emb-url-input
      autocomplete="${autocomplete}"
      ${disabled ? "disabled" : ""}
      placeholder="${placeholder}"
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
    ></emb-url-input>
  `
};

export default meta;

export const Default = {};
