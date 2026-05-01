const meta = {
  title: "Primitives/Listbox",
  render: () => `
    <cindor-listbox aria-label="Greek letter selection" style="width:min(100%, 320px);" selected-value="beta">
      <cindor-option value="alpha">Alpha</cindor-option>
      <cindor-option value="beta">Beta</cindor-option>
      <cindor-option value="gamma">Gamma</cindor-option>
    </cindor-listbox>
  `
};

export default meta;

export const Default = {};
