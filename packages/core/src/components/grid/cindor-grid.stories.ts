type GridStoryArgs = {
  align: "start" | "center" | "end" | "stretch" | "baseline";
  columns: number;
  gap: "0" | "1" | "2" | "3" | "4" | "5" | "6";
  justify: "start" | "center" | "end" | "stretch" | "baseline";
  minColumnWidth: string;
};

const meta = {
  title: "Layout/Grid",
  args: {
    align: "stretch",
    columns: 3,
    gap: "4",
    justify: "stretch",
    minColumnWidth: "14rem"
  },
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"]
    },
    columns: {
      control: { type: "number", min: 1, max: 6, step: 1 }
    },
    gap: {
      control: "select",
      options: ["0", "1", "2", "3", "4", "5", "6"]
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"]
    },
    minColumnWidth: {
      control: "text"
    }
  },
  render: ({ align, columns, gap, justify, minColumnWidth }: GridStoryArgs) => `
    <cindor-grid
      align="${align}"
      columns="${columns}"
      gap="${gap}"
      justify="${justify}"
      min-column-width="${minColumnWidth}"
    >
      <cindor-card><div style="padding: var(--space-4);">Overview</div></cindor-card>
      <cindor-card><div style="padding: var(--space-4);">Approvals</div></cindor-card>
      <cindor-card><div style="padding: var(--space-4);">Audit trail</div></cindor-card>
      <cindor-card><div style="padding: var(--space-4);">Release notes</div></cindor-card>
    </cindor-grid>
  `
};

export default meta;

export const Default = {};
