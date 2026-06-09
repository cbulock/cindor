const listItems = Array.from({ length: 24 }, (_, index) => ({
  id: `row-${index + 1}`,
  label: `Incident queue item ${index + 1}`,
  description: `Review deployment notes, handoff context, and owner status for item ${index + 1}.`,
  meta: index % 3 === 0 ? "Needs review" : "Healthy"
}));

const meta = {
  title: "Data/Virtual List",
  render: () => `
    <cindor-virtual-list id="storybook-virtual-list" height="20rem" item-height="72"></cindor-virtual-list>
    <script type="module">
      const list = document.querySelector("#storybook-virtual-list");
      list.items = ${JSON.stringify(listItems, null, 2)};
    </script>
  `
};

export default meta;

export const Default = {};
