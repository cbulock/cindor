import "../../register.js";

import { EmbPagination } from "./emb-pagination.js";

describe("emb-pagination", () => {
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
});
