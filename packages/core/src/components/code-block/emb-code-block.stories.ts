type CodeBlockStoryArgs = {
  code: string;
  language: string;
};

const meta = {
  title: "Components/Code Block",
  args: {
    code: `<emb-button variant="ghost">Cancel</emb-button>`,
    language: "html"
  },
  render: ({ code, language }: CodeBlockStoryArgs) =>
    `<emb-code-block code="${code.replace(/"/g, "&quot;")}" ${language ? `language="${language}"` : ""}></emb-code-block>`
};

export default meta;

export const Default = {};
