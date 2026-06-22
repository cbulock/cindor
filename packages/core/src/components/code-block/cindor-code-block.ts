import hljs from "highlight.js/lib/common";
import { css, html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

export class CindorCodeBlock extends LitElement {
  static styles = css`
    :host {
      display: block;
      --cindor-code-block-background: var(--surface-inverse);
      --cindor-code-block-border-color: var(--border);
      --cindor-code-block-color: var(--bg);
      --cindor-code-block-font-family: var(--font-mono);
      --cindor-code-block-font-weight: var(--weight-code);
    }

    :host-context([data-theme="dark"]),
    :host-context([data-theme="retro"]) {
      --cindor-code-block-background: var(--bg);
      --cindor-code-block-border-color: var(--border-strong);
      --cindor-code-block-color: var(--fg);
    }

    pre {
      margin: 0;
      padding: var(--space-4) var(--space-4) var(--space-3);
      overflow: auto;
      border: 1px solid var(--cindor-code-block-border-color);
      border-radius: var(--radius-lg);
      background: var(--cindor-code-block-background);
      color: var(--cindor-code-block-color);
      font-family: var(--cindor-code-block-font-family);
      font-size: var(--text-code-block-size);
      font-weight: var(--cindor-code-block-font-weight);
      line-height: var(--leading-code);
      letter-spacing: var(--tracking-code);
    }

    code {
      display: block;
      font: inherit;
      white-space: pre;
    }

    @media (max-width: 720px) {
      pre {
        font-size: var(--text-xs);
      }
    }

    slot {
      display: none;
    }

    .hljs-comment,
    .hljs-quote {
      color: #94a3b8;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #fda4af;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      color: #93c5fd;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      color: #86efac;
    }

    .hljs-title,
    .hljs-section {
      color: #fcd34d;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #c4b5fd;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: var(--weight-bold);
    }
  `;

  static properties = {
    code: { reflect: true },
    language: { reflect: true }
  };

  code = "";
  language = "";

  private slotCode = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.slotCode = this.textContent ?? "";
  }

  protected override render() {
    const highlighted = this.highlightedCode;

    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
      <pre part="surface">
        <code class=${highlighted.className} part="code">${unsafeHTML(highlighted.html)}</code>
      </pre>
    `;
  }

  private handleSlotChange = (): void => {
    this.slotCode = this.textContent ?? "";
    this.requestUpdate();
  };

  private get sourceCode(): string {
    return this.code || this.slotCode;
  }

  private get highlightedCode(): { className: string; html: string } {
    if (this.sourceCode === "") {
      return { className: "hljs", html: "" };
    }

    const normalizedLanguage = this.language.trim().toLowerCase();

    if (normalizedLanguage !== "" && hljs.getLanguage(normalizedLanguage)) {
      return {
        className: `hljs language-${normalizedLanguage}`,
        html: hljs.highlight(this.sourceCode, {
          ignoreIllegals: true,
          language: normalizedLanguage
        }).value
      };
    }

    const result = hljs.highlightAuto(this.sourceCode);

    return {
      className: result.language ? `hljs language-${result.language}` : "hljs",
      html: result.value
    };
  }
}
