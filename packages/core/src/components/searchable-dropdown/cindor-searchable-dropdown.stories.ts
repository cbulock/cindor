import { expect } from "storybook/test";
import type { CindorSearchableDropdown } from "./cindor-searchable-dropdown.js";

type SearchableDropdownStoryArgs = {
  disabled: boolean;
  label: string;
  optionOne: string;
  optionThree: string;
  optionTwo: string;
  placeholder: string;
  required: boolean;
  value: string;
};

const meta = {
  title: "Composites/Searchable Dropdown",
  args: {
    disabled: false,
    label: "Framework",
    optionOne: "Web Components",
    optionThree: "Vue",
    optionTwo: "React",
    placeholder: "Choose a framework",
    required: false,
    value: ""
  },
  render: ({
    disabled,
    label,
    optionOne,
    optionThree,
    optionTwo,
    placeholder,
    required,
    value
  }: SearchableDropdownStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <cindor-searchable-dropdown
       aria-label="${label}"
       ${disabled ? "disabled" : ""}
      ${required ? "required" : ""}
       placeholder="${placeholder}"
       value="${value}"
     >
       <cindor-option value="${optionOne}">${optionOne}</cindor-option>
       <cindor-option value="${optionTwo}">${optionTwo}</cindor-option>
       <cindor-option value="${optionThree}">${optionThree}</cindor-option>
       </cindor-searchable-dropdown>
     </div>
   `
};

export default meta;

export const Default = {};

export const Preselected = { args: { value: "React" } };
export const Disabled = { args: { disabled: true } };
export const Required = { args: { required: true } };

export const DistinctValueAndLabel = {
  render: () => '<cindor-searchable-dropdown aria-label="Country" value="gb"><option value="gb">United Kingdom</option><option value="us">United States</option></cindor-searchable-dropdown>'
};
export const DisabledOption = {
  render: () => '<cindor-searchable-dropdown aria-label="Role"><option value="admin" disabled>Administrator</option><option value="viewer">Viewer</option></cindor-searchable-dropdown>'
};
export const EmptyList = {
  render: () => '<cindor-searchable-dropdown aria-label="Owner" empty-message="No owners available"></cindor-searchable-dropdown>'
};
export const NoMatch = { parameters: { docs: { description: { story: "Type an unmatched query to see the announced empty state." } } } };


export const FieldsetDisabledRecovery = {
  render: () => '<form><fieldset><cindor-searchable-dropdown aria-label="Role" name="role" value="viewer"><option value="viewer">Viewer</option><option value="admin">Administrator</option></cindor-searchable-dropdown></fieldset></form>',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const form = canvasElement.querySelector("form")!;
    const fieldset = canvasElement.querySelector("fieldset")!;
    const dropdown = canvasElement.querySelector("cindor-searchable-dropdown") as CindorSearchableDropdown;
    await dropdown.updateComplete;
    const input = dropdown.shadowRoot!.querySelector("input")!;
    expect(new FormData(form).get("role")).toBe("viewer");
    input.focus();
    await dropdown.updateComplete;
    fieldset.disabled = true;
    await dropdown.updateComplete;
    expect(input.disabled).toBe(true);
    expect(dropdown.open).toBe(false);
    expect(dropdown.hasAttribute("disabled")).toBe(false);
    expect(new FormData(form).has("role")).toBe(false);
    fieldset.disabled = false;
    await dropdown.updateComplete;
    expect(input.disabled).toBe(false);
    expect(new FormData(form).get("role")).toBe("viewer");
    input.focus();
    input.click();
    await dropdown.updateComplete;
    expect(dropdown.open).toBe(true);
    (dropdown.shadowRoot!.querySelectorAll("cindor-option")[1] as HTMLElement).click();
    await dropdown.updateComplete;
    expect(dropdown.value).toBe("admin");
    expect(dropdown.shadowRoot!.activeElement).toBe(input);
    input.click();
    await dropdown.updateComplete;
    expect(dropdown.open).toBe(true);
    dropdown.remove();
    fieldset.append(dropdown);
    await dropdown.updateComplete;
    form.reset();
    await dropdown.updateComplete;
    expect(dropdown.value).toBe("viewer");
    expect(new FormData(form).get("role")).toBe("viewer");
  }
};
