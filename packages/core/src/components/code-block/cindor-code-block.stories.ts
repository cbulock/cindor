type CodeBlockStoryArgs = {
  code: string;
  language: string;
};

const meta = {
  title: "Components/Code Block",
  args: {
    code: `<cindor-button variant="ghost">Cancel</cindor-button>`,
    language: "html"
  },
  render: ({ code, language }: CodeBlockStoryArgs) =>
    `<cindor-code-block code="${code.replace(/"/g, "&quot;")}" ${language ? `language="${language}"` : ""}></cindor-code-block>`
};

export default meta;

export const Default = {};
