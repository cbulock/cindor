import { css, html, LitElement } from "lit";

import { renderLucideIcon } from "../icon/lucide.js";

type PaginationItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string };

export class EmbPagination extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    nav {
      color: var(--fg);
    }

    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    button {
      min-width: 2.25rem;
      min-height: 2.25rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      color: var(--fg);
      cursor: pointer;
      font: inherit;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    button:hover:not(:disabled):not([aria-current="page"]) {
      border-color: var(--border-strong);
      background: var(--bg-subtle);
      transform: translateY(-1px);
    }

    button:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
      background: var(--bg-subtle);
    }

    button[aria-current="page"] {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--accent-fg);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    .nav-icon {
      display: block;
      inline-size: 1rem;
      block-size: 1rem;
    }

    .ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.25rem;
      min-height: 2.25rem;
      color: var(--fg-subtle);
      font: inherit;
    }
  `;

  static properties = {
    currentPage: { type: Number, reflect: true, attribute: "current-page" },
    maxVisiblePages: { type: Number, reflect: true, attribute: "max-visible-pages" },
    totalPages: { type: Number, reflect: true, attribute: "total-pages" }
  };

  currentPage = 1;
  maxVisiblePages = 5;
  totalPages = 1;

  protected override render() {
    return html`
      <nav part="nav" aria-label="Pagination">
        <ol part="list">
          <li>
            <button
              part="button button-nav"
              type="button"
              aria-label="Previous page"
              ?disabled=${this.currentPage <= 1}
              @click=${this.goToPreviousPage}
            >
              ${renderLucideIcon({
                name: "chevron-left",
                size: 16,
                attributes: {
                  class: "nav-icon",
                  part: "nav-icon"
                }
              })}
            </button>
          </li>
          ${this.items.map((item) => {
            if (item.type === "ellipsis") {
              return html`
                <li>
                  <span class="ellipsis" part="ellipsis" aria-hidden="true">${"\u2026"}</span>
                </li>
              `;
            }

            return html`
              <li>
                <button
                  part="button button-page"
                  type="button"
                  data-page=${String(item.page)}
                  aria-label=${item.page === this.currentPage ? `Current page, page ${item.page}` : `Go to page ${item.page}`}
                  aria-current=${item.page === this.currentPage ? "page" : "false"}
                  @click=${() => this.selectPage(item.page)}
                >
                  ${item.page}
                </button>
              </li>
            `;
          })}
          <li>
            <button
              part="button button-nav"
              type="button"
              aria-label="Next page"
              ?disabled=${this.currentPage >= this.lastPage}
              @click=${this.goToNextPage}
            >
              ${renderLucideIcon({
                name: "chevron-right",
                size: 16,
                attributes: {
                  class: "nav-icon",
                  part: "nav-icon"
                }
              })}
            </button>
          </li>
        </ol>
      </nav>
    `;
  }

  private selectPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.lastPage);

    if (nextPage === this.currentPage) {
      return;
    }

    this.currentPage = nextPage;
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private goToNextPage = (): void => {
    this.selectPage(this.currentPage + 1);
  };

  private goToPreviousPage = (): void => {
    this.selectPage(this.currentPage - 1);
  };

  private get items(): PaginationItem[] {
    const pages = this.visiblePages;

    return pages.flatMap((page, index) => {
      const previousPage = pages[index - 1];

      if (previousPage === undefined || page === previousPage + 1) {
        return [{ type: "page", page }];
      }

      return [
        { type: "ellipsis", key: `ellipsis-${previousPage}-${page}` },
        { type: "page", page }
      ];
    });
  }

  private get lastPage(): number {
    return Math.max(this.totalPages, 1);
  }

  private get visiblePages(): number[] {
    const total = this.lastPage;
    const maxVisible = Math.max(3, Math.floor(this.maxVisiblePages) || 0);

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const current = Math.min(Math.max(this.currentPage, 1), total);
    const middleCount = maxVisible - 2;
    let start = current - Math.floor((middleCount - 1) / 2);
    let end = start + middleCount - 1;

    if (start < 2) {
      start = 2;
      end = start + middleCount - 1;
    }

    if (end > total - 1) {
      end = total - 1;
      start = end - middleCount + 1;
    }

    return [1, ...Array.from({ length: middleCount }, (_, index) => start + index), total].filter(
      (page, index, pages) => pages.indexOf(page) === index
    );
  }
}
