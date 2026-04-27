type ComboboxStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  label: string;
  optionOne: string;
  optionThree: string;
  optionTwo: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Composites/Combobox",
  args: {
    autocomplete: "",
    disabled: false,
    label: "Framework",
    optionOne: "Web Components",
    optionThree: "Vue",
    optionTwo: "React",
    placeholder: "Choose a framework",
    readonly: false,
    required: false,
    value: ""
  },
  render: ({
    autocomplete,
    disabled,
    label,
    optionOne,
    optionThree,
    optionTwo,
    placeholder,
    readonly,
    required,
    value
  }: ComboboxStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span id="combobox-story-label">${label}</span>
      <emb-combobox
       aria-labelledby="combobox-story-label"
       ${autocomplete ? `autocomplete="${autocomplete}"` : ""}
      ${disabled ? "disabled" : ""}
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
       placeholder="${placeholder}"
       value="${value}"
     >
       <emb-option value="${optionOne}">${optionOne}</emb-option>
       <emb-option value="${optionTwo}">${optionTwo}</emb-option>
       <emb-option value="${optionThree}">${optionThree}</emb-option>
       </emb-combobox>
     </div>
   `
};

export default meta;

export const Default = {};
