export type PaginationItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string };

export function getPaginationItems(currentPage: number, totalPages: number, maxVisiblePages: number): PaginationItem[] {
  const pages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

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

function getVisiblePages(currentPage: number, totalPages: number, maxVisiblePages: number): number[] {
  const total = Math.max(totalPages, 1);
  const maxVisible = Math.max(3, Math.floor(maxVisiblePages) || 0);

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const current = Math.min(Math.max(currentPage, 1), total);
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
