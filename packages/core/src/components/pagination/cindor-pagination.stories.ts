type PaginationStoryArgs = {
  currentPage: number;
  maxVisiblePages: number;
  totalPages: number;
};

const meta = {
  title: "Components/Pagination",
  args: {
    currentPage: 2,
    maxVisiblePages: 5,
    totalPages: 5
  },
  render: ({ currentPage, maxVisiblePages, totalPages }: PaginationStoryArgs) =>
    `<cindor-pagination current-page="${currentPage}" max-visible-pages="${maxVisiblePages}" total-pages="${totalPages}"></cindor-pagination>`
};

export default meta;

export const Default = {};
