const initialItems = [
  {
    id: "contact-1",
    label: "Primary contact",
    description: "Owns launch communication and approval routing.",
    meta: "Required"
  },
  {
    id: "contact-2",
    label: "Billing contact",
    description: "Receives invoices and renewal reminders.",
    meta: "Optional"
  }
];

const meta = {
  title: "Forms/Field Array",
  render: () => `
    <cindor-field-array id="storybook-field-array" min-items="1"></cindor-field-array>
    <script type="module">
      const fieldArray = document.querySelector("#storybook-field-array");
      fieldArray.items = ${JSON.stringify(initialItems, null, 2)};
      fieldArray.createItem = ({ items }) => ({
        id: "contact-" + (items.length + 1),
        label: "Additional contact " + (items.length + 1),
        description: "Add ownership notes and follow-up context.",
        meta: "Optional"
      });
    </script>
  `
};

export default meta;

export const Default = {};
