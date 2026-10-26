// Naming and descriptions use the shadow-safe a11y mirror, not this list.
export const buttonAriaAttributes = [
  "aria-pressed", "aria-busy", "aria-disabled", "aria-current",
  "aria-keyshortcuts", "aria-roledescription", "aria-controls",
  "aria-expanded", "aria-haspopup", "aria-atomic", "aria-live",
  "aria-relevant", "aria-hidden"
] as const;

export const buttonA11yObservedAttributes = [
  ...buttonAriaAttributes, "aria-label", "aria-labelledby",
  "aria-description", "aria-describedby", "id"
];

export function syncButtonAria(source: Element, target: Element): void {
  for (const attribute of buttonAriaAttributes) {
    const value = source.getAttribute(attribute);
    if (value === null || value === "") {
      target.removeAttribute(attribute);
    } else if (target.getAttribute(attribute) !== value) {
      target.setAttribute(attribute, value);
    }
  }
}
