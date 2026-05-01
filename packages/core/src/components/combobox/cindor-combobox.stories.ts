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
      <span>${label}</span>
      <cindor-combobox
       aria-label="${label}"
       ${autocomplete ? `autocomplete="${autocomplete}"` : ""}
       ${disabled ? "disabled" : ""}
       ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
       placeholder="${placeholder}"
       value="${value}"
     >
       <cindor-option value="${optionOne}">${optionOne}</cindor-option>
       <cindor-option value="${optionTwo}">${optionTwo}</cindor-option>
       <cindor-option value="${optionThree}">${optionThree}</cindor-option>
       </cindor-combobox>
     </div>
   `
};

export default meta;

export const Default = {};
