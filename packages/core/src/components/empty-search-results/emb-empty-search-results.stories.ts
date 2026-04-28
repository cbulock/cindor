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
    <emb-empty-search-results query="${query}">
      <ul>
        <li>Check spelling or abbreviations.</li>
        <li>Remove one or more filters.</li>
        <li>Search a broader project or workspace scope.</li>
      </ul>
      <emb-button slot="actions" variant="ghost">Reset filters</emb-button>
      <emb-button slot="actions">Create saved search</emb-button>
    </emb-empty-search-results>
  `
};

export default meta;

export const Default = {};
