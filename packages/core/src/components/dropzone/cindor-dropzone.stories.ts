type DropzoneStoryArgs = {
  accept: string;
  disabled: boolean;
  label: string;
  multiple: boolean;
  required: boolean;
};

const meta = {
  title: "Composites/Dropzone",
  args: {
    accept: ".png,.jpg,.pdf",
    disabled: false,
    label: "Upload attachments",
    multiple: true,
    required: false
  },
  render: ({ accept, disabled, label, multiple, required }: DropzoneStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 520px);">
      <span>${label}</span>
      <cindor-dropzone
        aria-label="${label}"
        ${accept ? `accept="${accept}"` : ""}
        ${disabled ? "disabled" : ""}
        ${multiple ? "multiple" : ""}
        ${required ? "required" : ""}
      ></cindor-dropzone>
    </div>
  `
};

export default meta;

export const Default = {};
