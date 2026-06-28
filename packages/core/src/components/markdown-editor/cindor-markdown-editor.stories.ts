const meta = {
  title: "Forms/Markdown Editor",
  render: () => `
    <cindor-markdown-editor id="storybook-markdown-editor" mode="split"></cindor-markdown-editor>
    <script type="module">
      const editor = document.querySelector("#storybook-markdown-editor");
      editor.value = ${JSON.stringify(`# Release notes

Ship the new workspace shell with:

- refreshed navigation
- payload inspection
- updated setup docs

> Coordinate rollout with support before enabling the feature flag.

\`\`\`ts
const ready = true;
\`\`\`
`, null, 2)};
    </script>
  `
};

export default meta;

export const Default = {};
