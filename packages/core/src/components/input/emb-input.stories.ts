type InputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  type: "text" | "email" | "password" | "url";
  value: string;
};

const meta = {
  title: "Components/Input",
  args: {
    autocomplete: "",
    disabled: false,
    placeholder: "Search projects",
    readonly: false,
    required: false,
    type: "text",
    value: ""
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "url"]
    }
  },
  render: ({ autocomplete, disabled, placeholder, readonly, required, type, value }: InputStoryArgs) =>
    `<emb-input ${autocomplete ? `autocomplete="${autocomplete}"` : ""} ${disabled ? "disabled" : ""} placeholder="${placeholder}" ${readonly ? "readonly" : ""} ${required ? "required" : ""} type="${type}" value="${value}"></emb-input>`
};

export default meta;

export const Default = {};

export const Filled = {
  args: {
    value: "Terminal dashboard"
  }
};
