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
 * Rule and group based filtering UI built from native fieldset, select, and input controls.
 *
 * The serialized `value` property stores the current filter group as JSON.
 *
 * @fires {CustomEvent<FilterBuilderChangeDetail>} input - Fired when the serialized filter value changes.
 * @fires {CustomEvent<FilterBuilderChangeDetail>} change - Fired when the serialized filter value changes.
 */
export class EmbFilterBuilder extends FormAssociatedElement {
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

    .group {
      display: grid;
      gap: var(--space-3);
      min-width: 0;
      margin: 0;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
    }

    .group > legend {
      padding-inline: var(--space-2);
      color: var(--fg-muted);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
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
      display: grid;
      gap: var(--space-1);
      min-width: 0;
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .control-label {
      font-weight: var(--weight-medium);
    }

    .field,
    .action {
      min-height: 2.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      color: inherit;
      font: inherit;
    }

    .field {
      width: 100%;
      padding: 0 var(--space-3);
    }

    select.field {
      padding-inline-end: calc(var(--space-6) + var(--space-2));
    }

    .field:focus-visible,
    .action:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 var(--space-3);
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out);
    }

    .action:hover:not(:disabled) {
      background: var(--bg-subtle);
    }

    .action:disabled,
    .field:disabled {
      cursor: not-allowed;
      opacity: 0.56;
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
      font-weight: 600;
    }

    .empty-copy {
      margin: 0;
      font-size: var(--text-sm);
    }

    @media (max-width: 840px) {
      .rule {
        grid-template-columns: minmax(0, 1fr);
      }

      .rule-actions {
        justify-content: flex-start;
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
      <fieldset class="group" part="group">
        <legend>${isRoot ? "Filters" : "Group"}</legend>
        <div class="group-toolbar" part="group-toolbar">
          <label class="control">
            <span class="control-label">Match</span>
            <select
              ?disabled=${this.disabled}
              .value=${group.logic}
              class="field"
              @change=${(event: Event) => this.updateGroupLogic(path, event)}
            >
              <option value="and">All conditions</option>
              <option value="or">Any condition</option>
            </select>
          </label>
          <div class="group-actions" part="group-actions">
            <button ?disabled=${this.disabled} class="action" type="button" @click=${() => this.addRule(path)}>Add rule</button>
            <button ?disabled=${this.disabled} class="action" type="button" @click=${() => this.addGroup(path)}>Add group</button>
            ${!isRoot
              ? html`
                  <button ?disabled=${this.disabled} class="action" type="button" @click=${() => this.removeNode(path)}>
                    Remove group
                  </button>
                `
              : null}
          </div>
        </div>
        <div class="children" part="children">
          ${group.children.map((child, index) => {
            const childPath = [...path, index];
            return child.type === "group" ? this.renderGroup(child, childPath) : this.renderRule(child, childPath);
          })}
        </div>
      </fieldset>
    `;
  }

  private renderRule(rule: FilterBuilderRule, path: number[]): unknown {
    const field = this.getField(rule.field);
    const operators = this.getOperators(field);

    return html`
      <div class="rule" part="rule">
        <label class="control">
          <span class="control-label">Field</span>
          <select
            ?disabled=${this.disabled}
            .value=${rule.field}
            class="field"
            @change=${(event: Event) => this.handleRuleFieldChange(path, event)}
          >
            ${this.fields.map(
              (candidate) => html`
                <option value=${candidate.value}>${candidate.label}</option>
              `
            )}
          </select>
        </label>
        <label class="control">
          <span class="control-label">Operator</span>
          <select
            ?disabled=${this.disabled}
            .value=${rule.operator}
            class="field"
            @change=${(event: Event) => this.handleRuleOperatorChange(path, event)}
          >
            ${operators.map(
              (operator) => html`
                <option value=${operator.value}>${operator.label}</option>
              `
            )}
          </select>
        </label>
        <label class="control">
          <span class="control-label">Value</span>
          ${this.renderValueControl(rule, path, field)}
        </label>
        <div class="rule-actions" part="rule-actions">
          <button ?disabled=${this.disabled} class="action" type="button" @click=${() => this.removeNode(path)}>Remove</button>
        </div>
      </div>
    `;
  }

  private renderValueControl(rule: FilterBuilderRule, path: number[], field?: FilterBuilderField): unknown {
    const type = this.getFieldType(field);

    if (type === "boolean") {
      return html`
        <select
          ?disabled=${this.disabled}
          .value=${rule.value}
          class="field"
          @change=${(event: Event) => this.handleRuleValueChange(path, event)}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      `;
    }

    if (type === "select") {
      return html`
        <select
          ?disabled=${this.disabled}
          .value=${rule.value}
          class="field"
          @change=${(event: Event) => this.handleRuleValueChange(path, event)}
        >
          ${(field?.options ?? []).map(
            (option) => html`
              <option value=${option.value}>${option.label}</option>
            `
          )}
        </select>
      `;
    }

    return html`
      <input
        ?disabled=${this.disabled}
        .value=${rule.value}
        class="field"
        placeholder=${field?.placeholder ?? ""}
        type=${type === "number" ? "number" : type === "date" ? "date" : "text"}
        @input=${(event: Event) => this.handleRuleValueChange(path, event)}
      />
    `;
  }

  private handleRuleFieldChange(path: number[], event: Event): void {
    const nextFieldValue = (event.currentTarget as HTMLSelectElement).value;
    this.commitGroup(
      this.updateRuleAtPath(this.group, path, () => {
        const nextField = this.getField(nextFieldValue);
        return this.createDefaultRule(nextField?.value ?? nextFieldValue);
      })
    );
  }

  private handleRuleOperatorChange(path: number[], event: Event): void {
    const nextOperator = (event.currentTarget as HTMLSelectElement).value;
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
    const nextValue = (event.currentTarget as HTMLInputElement | HTMLSelectElement).value;
    this.commitGroup(this.updateRuleAtPath(this.group, path, (rule) => ({ ...rule, value: nextValue })));
  }

  private updateGroupLogic(path: number[], event: Event): void {
    const nextLogic = (event.currentTarget as HTMLSelectElement).value as FilterBuilderLogic;
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
      throw new Error(`Invalid emb-filter-builder value JSON: ${message}`);
    }

    if (!parsed || typeof parsed !== "object" || (parsed as { type?: string }).type !== "group") {
      throw new Error("Invalid emb-filter-builder value JSON: expected a root group object.");
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
}
