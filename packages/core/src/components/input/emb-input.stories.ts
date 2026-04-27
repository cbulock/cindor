type InputStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  endIcon: string;
  label: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  startIcon: string;
  type: "text" | "email" | "password" | "url";
  value: string;
};

const meta = {
  title: "Primitives/Input",
  args: {
    autocomplete: "",
    disabled: false,
    endIcon: "",
    label: "Project name",
    placeholder: "Search projects",
    readonly: false,
    required: false,
    startIcon: "",
    type: "text",
    value: ""
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "url"]
    }
  },
  render: ({ autocomplete, disabled, endIcon, label, placeholder, readonly, required, startIcon, type, value }: InputStoryArgs) =>
    `<div style="display:grid;gap:8px;width:min(100%, 320px);"><span id="input-story-label">${label}</span><emb-input aria-labelledby="input-story-label" ${autocomplete ? `autocomplete="${autocomplete}"` : ""} ${disabled ? "disabled" : ""} ${endIcon ? `end-icon="${endIcon}"` : ""} placeholder="${placeholder}" ${readonly ? "readonly" : ""} ${required ? "required" : ""} ${startIcon ? `start-icon="${startIcon}"` : ""} type="${type}" value="${value}"></emb-input></div>`
};

export default meta;

export const Default = {};

export const Filled = {
  args: {
    value: "Terminal dashboard"
  }
};

export const WithIcons = {
  args: {
    endIcon: "x",
    startIcon: "search"
  }
};
