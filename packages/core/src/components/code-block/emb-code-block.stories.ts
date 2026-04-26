type CodeBlockStoryArgs = {
  code: string;
};

const meta = {
  title: "Components/Code Block",
  args: {
    code: `<emb-button variant="ghost">Cancel</emb-button>`
  },
  render: ({ code }: CodeBlockStoryArgs) => `<emb-code-block code="${code.replace(/"/g, "&quot;")}"></emb-code-block>`
};

export default meta;

export const Default = {};
