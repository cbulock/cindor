type EmptySearchResultsStoryArgs = {
  query: string;
};

const meta = {
  title: "Display/Empty Search Results",
  args: {
    query: "access policy"
  },
  argTypes: {
    query: {
      control: "text"
    }
  },
  render: ({ query }: EmptySearchResultsStoryArgs) => `
    <cindor-empty-search-results query="${query}">
      <ul>
        <li>Check spelling or abbreviations.</li>
        <li>Remove one or more filters.</li>
        <li>Search a broader project or workspace scope.</li>
      </ul>
      <cindor-button slot="actions" variant="ghost">Reset filters</cindor-button>
      <cindor-button slot="actions">Create saved search</cindor-button>
    </cindor-empty-search-results>
  `
};

export default meta;

export const Default = {};
