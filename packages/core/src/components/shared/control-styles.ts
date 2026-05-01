import { css, unsafeCSS, type CSSResultGroup } from "lit";

type TextControlStyleOptions = {
  includePlaceholder?: boolean;
  lineHeight?: string;
  minBlockSize?: string;
  padding?: string;
  resize?: string;
};

export function createFieldHostStyles(defaultWidth: string): CSSResultGroup {
  return css`
    :host {
      display: inline-block;
      width: var(--cindor-field-inline-size, ${unsafeCSS(defaultWidth)});
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }
  `;
}

export function createTextControlStyles(selector: string, options: TextControlStyleOptions = {}): CSSResultGroup {
  const minBlockSize = options.minBlockSize ?? "36px";
  const padding = options.padding ?? "0 var(--space-3)";
  const lineHeightStyles = options.lineHeight
    ? css`
        ${unsafeCSS(selector)} {
          line-height: ${unsafeCSS(options.lineHeight)};
        }
      `
    : css``;
  const resizeStyles = options.resize
    ? css`
        ${unsafeCSS(selector)} {
          resize: ${unsafeCSS(options.resize)};
        }
      `
    : css``;
  const placeholderStyles = options.includePlaceholder === false
    ? css``
    : css`
        ${unsafeCSS(selector)}::placeholder {
          color: var(--fg-subtle);
        }
      `;

  return [
    css`
      ${unsafeCSS(selector)} {
        box-sizing: border-box;
        width: 100%;
        min-height: ${unsafeCSS(minBlockSize)};
        padding: ${unsafeCSS(padding)};
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--surface);
        color: var(--fg);
        font: inherit;
        transition:
          border-color var(--duration-base) var(--ease-out),
          box-shadow var(--duration-base) var(--ease-out),
          background var(--duration-base) var(--ease-out);
      }
    `,
    lineHeightStyles,
    resizeStyles,
    placeholderStyles,
    css`
      ${unsafeCSS(selector)}:disabled {
        cursor: not-allowed;
        color: var(--fg-subtle);
        background: var(--bg-subtle);
      }

      ${unsafeCSS(selector)}:focus-visible {
        outline: none;
        box-shadow: var(--ring-focus);
      }
    `
  ];
}

export const floatingListboxStyles = css`
  cindor-listbox {
    position: fixed;
    z-index: 10;
    max-block-size: 240px;
    overflow: auto;
  }
`;

export const hiddenSlotStyles = css`
  slot {
    display: none;
  }
`;
