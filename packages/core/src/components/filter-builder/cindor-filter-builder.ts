import { css, html } from "lit";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export type FilterBuilderLogic = "and" | "or";
export type FilterBuilderFieldType = "text" | "number" | "date" | "select" | "boolean";

export type FilterBuilderOption = {
  label: string;
  value: string;
};

export type FilterBuilderOperator = {
  label: string;
  value: string;
};

export type FilterBuilderField = {
  label: string;
  operators?: FilterBuilderOperator[];
  options?: FilterBuilderOption[];
  placeholder?: string;
  type?: FilterBuilderFieldType;
  value: string;
};

export type FilterBuilderRule = {
  field: string;
  id: string;
  operator: string;
  type: "rule";
  value: string;
};

export type FilterBuilderGroup = {
  children: FilterBuilderNode[];
  id: string;
  logic: FilterBuilderLogic;
  type: "group";
};

export type FilterBuilderNode = FilterBuilderRule | FilterBuilderGroup;

type FilterBuilderChangeDetail = {
  group: FilterBuilderGroup;
  value: string;
};

const defaultOperators: Record<FilterBuilderFieldType, FilterBuilderOperator[]> = {
  boolean: [{ label: "is", value: "is" }],
  date: [
    { label: "is on", value: "is" },
    { label: "before", value: "before" },
    { label: "after", value: "after" }
  ],
  number: [
    { label: "is", value: "is" },
    { label: "is greater than", value: "gt" },
    { label: "is less than", value: "lt" }
  ],
  select: [
    { label: "is", value: "is" },
    { label: "is not", value: "is-not" }
  ],
  text: [
    { label: "contains", value: "contains" },
    { label: "is", value: "is" },
    { label: "starts with", value: "starts-with" }
  ]
};

/**
 * Rule and group based filtering UI built from Cindor field, button, and fieldset primitives.
 *
 * The serialized `value` property stores the current filter group as JSON.
 *
 * @fires {CustomEvent<FilterBuilderChangeDetail>} input - Fired when the serialized filter value changes.
 * @fires {CustomEvent<FilterBuilderChangeDetail>} change - Fired when the serialized filter value changes.
 */
export class CindorFilterBuilder extends FormAssociatedElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface,
    .empty {
      display: grid;
      gap: var(--space-4);
    }

    .group-fieldset {
      --cindor-fieldset-inline-size: 100%;
    }

    .group-surface {
      display: grid;
      gap: var(--space-3);
      min-width: 0;
    }

    .group-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .group-actions,
    .rule-actions {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .children {
      display: grid;
      gap: var(--space-3);
    }

    .group-toolbar > .control {
      flex: 1 1 min(16rem, 100%);
    }

    .rule {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
      gap: var(--space-2);
      align-items: end;
      min-width: 0;
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-subtle);
    }

    .control {
      min-width: 0;
    }

    .control,
    .control cindor-form-field {
      --cindor-field-inline-size: 100%;
    }

    .control :is(cindor-select, cindor-input, cindor-date-input, cindor-number-input) {
      --cindor-field-inline-size: 100%;
    }

    .action-button {
      --cindor-button-min-height: 2.5rem;
      --cindor-button-ghost-background: var(--surface);
      --cindor-button-ghost-border-color: var(--border);
      --cindor-button-ghost-color: var(--fg);
      --cindor-button-hover-background: var(--bg-subtle);
      --cindor-button-hover-border-color: var(--border-strong);
    }

    .group-actions .action-button,
    .rule-actions .action-button {
      flex: 0 0 auto;
    }

    .empty {
      padding: var(--space-5);
      border: 1px dashed var(--border);
      border-radius: var(--radius-xl);
      background: var(--bg-subtle);
      color: var(--fg-muted);
    }

    .empty-title {
      margin: 0;
      color: var(--fg);
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
    }

    .empty-copy {
      margin: 0;
      font-size: var(--text-sm);
    }

    @media (max-width: 960px) {
      .rule {
        grid-template-columns: minmax(0, 1fr);
      }

      .rule-actions {
        justify-content: flex-start;
      }

      .group-actions {
        width: 100%;
      }
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    fields: { attribute: false },
    name: { reflect: true },
    value: {}
  };

  disabled = false;
  fields: FilterBuilderField[] = [];
  name = "";
  value = "";

  private group: FilterBuilderGroup = this.createDefaultGroup();
  private idCounter = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.group = this.normalizeGroup(this.parseValue(this.value) ?? this.createDefaultGroup());
    const serialized = this.serializeGroup(this.group);
    if (this.value !== serialized) {
      this.value = serialized;
    }
    this.syncFormState();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected override render() {
    if (this.fields.length === 0) {
      return html`
        <div class="empty" part="empty">
          <p class="empty-title">No filter fields configured</p>
          <p class="empty-copy">Provide the <code>fields</code> property to render a rule and group builder.</p>
        </div>
      `;
    }

    return html`<div class="surface" part="surface">${this.renderGroup(this.group, [])}</div>`;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("value")) {
      const parsed = this.parseValue(this.value);
      if (parsed) {
        const normalized = this.normalizeGroup(parsed);
        if (this.serializeGroup(normalized) !== this.serializeGroup(this.group)) {
          this.group = normalized;
          this.requestUpdate();
        }
      }
    }

    if (changedProperties.has("fields")) {
      const normalized = this.normalizeGroup(this.group);
      const serialized = this.serializeGroup(normalized);
      if (serialized !== this.serializeGroup(this.group)) {
        this.group = normalized;
        this.value = serialized;
        return;
      }
    }

    this.syncFormState();
  }

  private renderGroup(group: FilterBuilderGroup, path: number[]): unknown {
    const isRoot = path.length === 0;

    return html`
      <cindor-fieldset class="group-fieldset" part="group" ?disabled=${this.disabled} legend=${isRoot ? "Filters" : "Group"}>
        <div class="group-surface">
          <div class="group-toolbar" part="group-toolbar">
            <div class="control">
              <cindor-form-field label="Match">
                <cindor-select ?disabled=${this.disabled} .value=${group.logic} @change=${(event: Event) => this.updateGroupLogic(path, event)}>
                  <option value="and">All conditions</option>
                  <option value="or">Any condition</option>
                </cindor-select>
              </cindor-form-field>
            </div>
            <div class="group-actions" part="group-actions">
              ${this.renderActionButton("Add rule", () => this.addRule(path))}
              ${this.renderActionButton("Add group", () => this.addGroup(path))}
              ${!isRoot ? this.renderActionButton("Remove group", () => this.removeNode(path)) : null}
            </div>
          </div>
          <div class="children" part="children">
            ${group.children.map((child, index) => {
              const childPath = [...path, index];
              return child.type === "group" ? this.renderGroup(child, childPath) : this.renderRule(child, childPath);
            })}
          </div>
        </div>
      </cindor-fieldset>
    `;
  }

  private renderRule(rule: FilterBuilderRule, path: number[]): unknown {
    const field = this.getField(rule.field);
    const operators = this.getOperators(field);

    return html`
      <div class="rule" part="rule">
        <div class="control">
          <cindor-form-field label="Field">
            <cindor-select ?disabled=${this.disabled} .value=${rule.field} @change=${(event: Event) => this.handleRuleFieldChange(path, event)}>
              ${this.fields.map(
                (candidate) => html`
                  <option value=${candidate.value}>${candidate.label}</option>
                `
              )}
            </cindor-select>
          </cindor-form-field>
        </div>
        <div class="control">
          <cindor-form-field label="Operator">
            <cindor-select ?disabled=${this.disabled} .value=${rule.operator} @change=${(event: Event) => this.handleRuleOperatorChange(path, event)}>
              ${operators.map(
                (operator) => html`
                  <option value=${operator.value}>${operator.label}</option>
                `
              )}
            </cindor-select>
          </cindor-form-field>
        </div>
        <div class="control">
          <cindor-form-field label="Value">${this.renderValueControl(rule, path, field)}</cindor-form-field>
        </div>
        <div class="rule-actions" part="rule-actions">
          ${this.renderActionButton("Remove", () => this.removeNode(path))}
        </div>
      </div>
    `;
  }

  private renderActionButton(label: string, onClick: () => void): unknown {
    return html`
      <cindor-button ?disabled=${this.disabled} class="action-button" type="button" variant="ghost" @click=${onClick}>
        ${label}
      </cindor-button>
    `;
  }

  private renderValueControl(rule: FilterBuilderRule, path: number[], field?: FilterBuilderField): unknown {
    const type = this.getFieldType(field);

    if (type === "boolean") {
      return html`
        <cindor-select ?disabled=${this.disabled} .value=${rule.value} @change=${(event: Event) => this.handleRuleValueChange(path, event)}>
          <option value="true">True</option>
          <option value="false">False</option>
        </cindor-select>
      `;
    }

    if (type === "select") {
      return html`
        <cindor-select ?disabled=${this.disabled} .value=${rule.value} @change=${(event: Event) => this.handleRuleValueChange(path, event)}>
          ${(field?.options ?? []).map(
            (option) => html`
              <option value=${option.value}>${option.label}</option>
            `
          )}
        </cindor-select>
      `;
    }

    if (type === "number") {
      return html`
        <cindor-number-input
          ?disabled=${this.disabled}
          .value=${rule.value}
          placeholder=${field?.placeholder ?? ""}
          @input=${(event: Event) => this.handleRuleValueChange(path, event)}
        ></cindor-number-input>
      `;
    }

    if (type === "date") {
      return html`
        <cindor-date-input ?disabled=${this.disabled} .value=${rule.value} @input=${(event: Event) => this.handleRuleValueChange(path, event)}></cindor-date-input>
      `;
    }

    return html`
      <cindor-input
        ?disabled=${this.disabled}
        .value=${rule.value}
        placeholder=${field?.placeholder ?? ""}
        @input=${(event: Event) => this.handleRuleValueChange(path, event)}
      ></cindor-input>
    `;
  }

  private handleRuleFieldChange(path: number[], event: Event): void {
    const nextFieldValue = this.getControlValue(event);
    this.commitGroup(
      this.updateRuleAtPath(this.group, path, () => {
        const nextField = this.getField(nextFieldValue);
        return this.createDefaultRule(nextField?.value ?? nextFieldValue);
      })
    );
  }

  private handleRuleOperatorChange(path: number[], event: Event): void {
    const nextOperator = this.getControlValue(event);
    this.commitGroup(
      this.updateRuleAtPath(this.group, path, (rule) => {
        const field = this.getField(rule.field);
        return {
          ...rule,
          operator: nextOperator,
          value: this.normalizeRuleValue(rule.value, field)
        };
      })
    );
  }

  private handleRuleValueChange(path: number[], event: Event): void {
    const nextValue = this.getControlValue(event);
    this.commitGroup(this.updateRuleAtPath(this.group, path, (rule) => ({ ...rule, value: nextValue })));
  }

  private updateGroupLogic(path: number[], event: Event): void {
    const nextLogic = this.getControlValue(event) === "or" ? "or" : "and";
    this.commitGroup(this.updateGroupAtPath(this.group, path, (group) => ({ ...group, logic: nextLogic })));
  }

  private addRule(path: number[]): void {
    this.commitGroup(
      this.updateGroupAtPath(this.group, path, (group) => ({
        ...group,
        children: [...group.children, this.createDefaultRule()]
      }))
    );
  }

  private addGroup(path: number[]): void {
    this.commitGroup(
      this.updateGroupAtPath(this.group, path, (group) => ({
        ...group,
        children: [...group.children, this.createDefaultGroup()]
      }))
    );
  }

  private removeNode(path: number[]): void {
    this.commitGroup(this.removeNodeAtPath(this.group, path));
  }

  private commitGroup(group: FilterBuilderGroup): void {
    const normalized = this.normalizeGroup(group);
    this.group = normalized;
    this.value = this.serializeGroup(normalized);
    this.syncFormState();
    this.dispatchValueEvents();
  }

  private dispatchValueEvents(): void {
    const detail: FilterBuilderChangeDetail = {
      group: this.group,
      value: this.value
    };

    this.dispatchEvent(new CustomEvent("input", { bubbles: true, composed: true, detail }));
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail }));
  }

  private syncFormState(): void {
    this.setFormValue(!this.disabled && this.name ? this.value : null);
  }

  private updateGroupAtPath(
    group: FilterBuilderGroup,
    path: number[],
    updater: (group: FilterBuilderGroup) => FilterBuilderGroup
  ): FilterBuilderGroup {
    if (path.length === 0) {
      return updater(group);
    }

    const [index, ...rest] = path;
    const child = group.children[index];
    if (!child || child.type !== "group") {
      return group;
    }

    const nextChild = this.updateGroupAtPath(child, rest, updater);
    if (nextChild === child) {
      return group;
    }

    const nextChildren = [...group.children];
    nextChildren[index] = nextChild;
    return { ...group, children: nextChildren };
  }

  private updateRuleAtPath(
    group: FilterBuilderGroup,
    path: number[],
    updater: (rule: FilterBuilderRule) => FilterBuilderRule
  ): FilterBuilderGroup {
    const [index, ...rest] = path;
    if (index === undefined) {
      return group;
    }

    if (rest.length === 0) {
      const child = group.children[index];
      if (!child || child.type !== "rule") {
        return group;
      }

      const nextChildren = [...group.children];
      nextChildren[index] = updater(child);
      return { ...group, children: nextChildren };
    }

    const child = group.children[index];
    if (!child || child.type !== "group") {
      return group;
    }

    const nextChild = this.updateRuleAtPath(child, rest, updater);
    if (nextChild === child) {
      return group;
    }

    const nextChildren = [...group.children];
    nextChildren[index] = nextChild;
    return { ...group, children: nextChildren };
  }

  private removeNodeAtPath(group: FilterBuilderGroup, path: number[]): FilterBuilderGroup {
    const [index, ...rest] = path;
    if (index === undefined) {
      return group;
    }

    if (rest.length === 0) {
      return {
        ...group,
        children: group.children.filter((_, childIndex) => childIndex !== index)
      };
    }

    const child = group.children[index];
    if (!child || child.type !== "group") {
      return group;
    }

    const nextChild = this.removeNodeAtPath(child, rest);
    const nextChildren = [...group.children];
    nextChildren[index] = nextChild;
    return { ...group, children: nextChildren };
  }

  private createDefaultGroup(): FilterBuilderGroup {
    return {
      children: this.fields.length > 0 ? [this.createDefaultRule()] : [],
      id: this.createId("group"),
      logic: "and",
      type: "group"
    };
  }

  private createDefaultRule(fieldValue?: string): FilterBuilderRule {
    const field = this.getField(fieldValue ?? this.fields[0]?.value ?? "") ?? this.fields[0];
    const operators = this.getOperators(field);
    return {
      field: field?.value ?? "",
      id: this.createId("rule"),
      operator: operators[0]?.value ?? "is",
      type: "rule",
      value: this.getDefaultValue(field)
    };
  }

  private normalizeGroup(group: FilterBuilderGroup): FilterBuilderGroup {
    const normalizedChildren = group.children
      .map((child) => (child.type === "group" ? this.normalizeGroup(child) : this.normalizeRule(child)))
      .filter((child): child is FilterBuilderNode => Boolean(child));

    return {
      children: normalizedChildren.length > 0 || this.fields.length === 0 ? normalizedChildren : [this.createDefaultRule()],
      id: group.id || this.createId("group"),
      logic: group.logic === "or" ? "or" : "and",
      type: "group"
    };
  }

  private normalizeRule(rule: FilterBuilderRule): FilterBuilderRule {
    const field = this.getField(rule.field) ?? this.fields[0];
    const operators = this.getOperators(field);
    const operator = operators.some((candidate) => candidate.value === rule.operator) ? rule.operator : (operators[0]?.value ?? "is");

    return {
      field: field?.value ?? "",
      id: rule.id || this.createId("rule"),
      operator,
      type: "rule",
      value: this.normalizeRuleValue(rule.value, field)
    };
  }

  private normalizeRuleValue(value: string, field?: FilterBuilderField): string {
    const type = this.getFieldType(field);

    if (type === "boolean") {
      return value === "false" ? "false" : "true";
    }

    if (type === "select") {
      const options = field?.options ?? [];
      if (options.some((option) => option.value === value)) {
        return value;
      }

      return options[0]?.value ?? "";
    }

    return value ?? "";
  }

  private getDefaultValue(field?: FilterBuilderField): string {
    const type = this.getFieldType(field);

    if (type === "boolean") {
      return "true";
    }

    if (type === "select") {
      return field?.options?.[0]?.value ?? "";
    }

    return "";
  }

  private getField(fieldValue: string): FilterBuilderField | undefined {
    return this.fields.find((field) => field.value === fieldValue);
  }

  private getFieldType(field?: FilterBuilderField): FilterBuilderFieldType {
    return field?.type ?? "text";
  }

  private getOperators(field?: FilterBuilderField): FilterBuilderOperator[] {
    const operators = field?.operators;
    if (operators && operators.length > 0) {
      return operators;
    }

    return defaultOperators[this.getFieldType(field)];
  }

  private parseValue(value: string): FilterBuilderGroup | null {
    if (value.trim() === "") {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid cindor-filter-builder value JSON: ${message}`);
    }

    if (!parsed || typeof parsed !== "object" || (parsed as { type?: string }).type !== "group") {
      throw new Error("Invalid cindor-filter-builder value JSON: expected a root group object.");
    }

    return parsed as FilterBuilderGroup;
  }

  private serializeGroup(group: FilterBuilderGroup): string {
    return JSON.stringify(group);
  }

  private createId(prefix: string): string {
    const value = `${prefix}-${this.idCounter}`;
    this.idCounter += 1;
    return value;
  }

  private getControlValue(event: Event): string {
    const currentTarget = event.currentTarget;
    if (currentTarget && typeof currentTarget === "object" && "value" in currentTarget) {
      const value = (currentTarget as { value: unknown }).value;
      return typeof value === "string" ? value : String(value ?? "");
    }

    return "";
  }
}
