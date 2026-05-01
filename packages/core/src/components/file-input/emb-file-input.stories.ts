type FileInputStoryArgs = {
  accept: string;
  disabled: boolean;
  label: string;
  multiple: boolean;
  required: boolean;
};

const meta = {
  title: "Composites/File Input",
  args: {
    accept: ".png,.jpg",
    disabled: false,
    label: "Upload assets",
    multiple: true,
    required: false
  },
  render: ({ accept, disabled, label, multiple, required }: FileInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 420px);">
      <span id="file-input-story-label">${label}</span>
      <emb-file-input
        aria-label="${label}"
        ${accept ? `accept="${accept}"` : ""}
        ${disabled ? "disabled" : ""}
        ${multiple ? "multiple" : ""}
        ${required ? "required" : ""}
      ></emb-file-input>
    </div>
  `
};

export default meta;

export const Default = {};
