import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

export class CindorLink extends LitElement {
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true
  };

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
  private readonly hostA11yObserver = new MutationObserver(() => {
    this.requestUpdate();
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.hostA11yObserver.observe(this, {
      attributeFilter: ["aria-description", "aria-describedby", "aria-label", "aria-labelledby"],
      attributes: true
    });
  }

  override disconnectedCallback(): void {
    this.hostA11yObserver.disconnect();
    super.disconnectedCallback();
  }

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
        aria-description=${ifDefined(this.hostAriaDescription)}
        aria-describedby=${ifDefined(this.hostAriaDescribedBy)}
        aria-label=${ifDefined(this.hostAriaLabel)}
        aria-labelledby=${ifDefined(this.hostAriaLabelledBy)}
        href=${ifDefined(this.href || undefined)}
        target=${ifDefined(this.target || undefined)}
        rel=${ifDefined(this.resolvedRel)}
        download=${ifDefined(this.download || undefined)}
      >
        <slot></slot>
      </a>
    `;
  }

  private get anchorElement(): HTMLAnchorElement | null {
    return this.renderRoot.querySelector("a");
  }

  private get resolvedRel(): string | undefined {
    if (this.rel) {
      return this.rel;
    }

    return this.target === "_blank" ? "noreferrer noopener" : undefined;
  }

  private get hostAriaDescribedBy(): string | undefined {
    return this.getAttribute("aria-describedby") ?? undefined;
  }

  private get hostAriaDescription(): string | undefined {
    return this.getAttribute("aria-description") ?? undefined;
  }

  private get hostAriaLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? undefined;
  }

  private get hostAriaLabelledBy(): string | undefined {
    return this.getAttribute("aria-labelledby") ?? undefined;
  }
}
