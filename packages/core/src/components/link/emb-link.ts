import { css, html, LitElement } from "lit";

export class EmbLink extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    a {
      color: var(--accent);
      text-decoration-thickness: 1px;
      text-underline-offset: 0.15em;
      transition: color var(--duration-base) var(--ease-out);
    }

    a:hover {
      color: var(--accent-hover);
    }

    a:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
      border-radius: var(--radius-sm);
    }
  `;

  static properties = {
    download: { reflect: true },
    href: { reflect: true },
    rel: { reflect: true },
    target: { reflect: true }
  };

  download = "";
  href = "";
  rel = "";
  target = "";

  override click(): void {
    this.anchorElement?.click();
  }

  override focus(options?: FocusOptions): void {
    this.anchorElement?.focus(options);
  }

  protected override render() {
    return html`
      <a
        part="control"
        href=${this.href || "#"}
        target=${this.target || ""}
        rel=${this.resolvedRel}
        download=${this.download || ""}
      >
        <slot></slot>
      </a>
    `;
  }

  private get anchorElement(): HTMLAnchorElement | null {
    return this.renderRoot.querySelector("a");
  }

  private get resolvedRel(): string {
    if (this.rel) {
      return this.rel;
    }

    return this.target === "_blank" ? "noreferrer noopener" : "";
  }
}
