import { css, html, LitElement } from "lit";

/**
 * Optional tab panel wrapper for {@link EmbTabs}.
 *
 * @slot - Panel content.
 */
export class EmbTabPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }
  `;

  static properties = {
    label: { reflect: true },
    value: { reflect: true }
  };

  label = "";

  value = "";

  protected override render() {
    return html`<slot></slot>`;
  }

  protected override updated(): void {
    this.syncPanelData();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncPanelData();
  }

  private syncPanelData(): void {
    if (this.label === "") {
      delete this.dataset.label;
    } else {
      this.dataset.label = this.label;
    }

    if (this.value === "") {
      delete this.dataset.value;
    } else {
      this.dataset.value = this.value;
    }
  }
}
