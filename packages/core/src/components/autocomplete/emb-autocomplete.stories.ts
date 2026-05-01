const meta = {
  title: "Forms/Autocomplete",
  render: () => `
    <emb-autocomplete id="autocomplete-story" aria-label="Search people" placeholder="Search people"></emb-autocomplete>
    <script>
      const element = document.getElementById("autocomplete-story");
      if (element) {
        element.suggestions = [
          { label: "Avery Stone", description: "Design" },
          { label: "Jordan Lee", description: "Engineering" },
          { label: "Morgan Cruz", description: "Product" }
        ];
      }
    </script>
  `
};

export default meta;

export const Default = {};
