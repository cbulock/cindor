import { EmbOption } from "../option/emb-option.js";

export type LightDomOption = {
  disabled: boolean;
  label: string;
  selected: boolean;
  value: string;
};

function toLightDomOption(child: Element): LightDomOption | null {
  if (child instanceof HTMLOptionElement) {
    return {
      disabled: child.disabled,
      label: child.label || child.textContent?.trim() || child.value,
      selected: child.selected,
      value: child.value
    };
  }

  if (child instanceof EmbOption) {
    return {
      disabled: child.disabled,
      label: child.label || child.textContent?.trim() || child.value,
      selected: child.selected,
      value: child.value
    };
  }

  return null;
}

export function readLightDomOptions(root: ParentNode): LightDomOption[] {
  return Array.from(root.children)
    .map((child) => toLightDomOption(child))
    .filter((option): option is LightDomOption => option !== null);
}

export function syncLightDomOptionSelection(root: ParentNode, selectedValues: Iterable<string>): void {
  const selectedValueSet = new Set(selectedValues);

  for (const child of Array.from(root.children)) {
    if (child instanceof HTMLOptionElement || child instanceof EmbOption) {
      child.selected = selectedValueSet.has(child.value);
    }
  }
}
