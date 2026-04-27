import "../../register.js";

import { EmbPagination } from "./emb-pagination.js";

describe("emb-pagination", () => {
  it("moves with the previous and next navigation buttons", async () => {
    const element = document.createElement("emb-pagination") as EmbPagination;
    element.currentPage = 2;
    element.totalPages = 4;
    document.body.append(element);
    await element.updateComplete;

    const navButtons = element.renderRoot.querySelectorAll('[part~="button-nav"]');
    const previousButton = navButtons[0] as HTMLButtonElement;
    const nextButton = navButtons[1] as HTMLButtonElement;

    nextButton.click();
    await element.updateComplete;
    expect(element.currentPage).toBe(3);

    previousButton.click();
    await element.updateComplete;
    expect(element.currentPage).toBe(2);
  });

  it("clamps page selection to the valid range", async () => {
    const element = document.createElement("emb-pagination") as EmbPagination;
    element.currentPage = 2;
    element.totalPages = 4;
    document.body.append(element);
    await element.updateComplete;

    element.dispatchEvent = vi.fn();

    (element as unknown as { selectPage: (page: number) => void }).selectPage(99);
    await element.updateComplete;
    expect(element.currentPage).toBe(4);

    (element as unknown as { selectPage: (page: number) => void }).selectPage(0);
    await element.updateComplete;
    expect(element.currentPage).toBe(1);
  });

  it("updates current page when a page button is clicked", async () => {
    const element = document.createElement("emb-pagination") as EmbPagination;
    element.currentPage = 1;
    element.totalPages = 3;
    document.body.append(element);
    await element.updateComplete;

    const pageTwoButton = element.renderRoot.querySelector('[data-page="2"]');
    pageTwoButton?.dispatchEvent(new Event("click"));
    await element.updateComplete;

    expect(element.currentPage).toBe(2);
  });

  it("limits visible page buttons to the configured maximum", async () => {
    const element = document.createElement("emb-pagination") as EmbPagination;
    element.currentPage = 5;
    element.totalPages = 10;
    element.maxVisiblePages = 5;
    document.body.append(element);
    await element.updateComplete;

    const pageButtons = Array.from(element.renderRoot.querySelectorAll('[data-page]')).map((button) =>
      Number(button.getAttribute("data-page"))
    );
    const ellipses = element.renderRoot.querySelectorAll('[part="ellipsis"]');

    expect(pageButtons).toEqual([1, 4, 5, 6, 10]);
    expect(ellipses).toHaveLength(2);
  });

  it("uses a minimum of three visible page slots", async () => {
    const element = document.createElement("emb-pagination") as EmbPagination;
    element.currentPage = 3;
    element.totalPages = 8;
    element.maxVisiblePages = 1;
    document.body.append(element);
    await element.updateComplete;

    const pageButtons = Array.from(element.renderRoot.querySelectorAll('[data-page]')).map((button) =>
      Number(button.getAttribute("data-page"))
    );

    expect(pageButtons).toEqual([1, 3, 8]);
  });
});
