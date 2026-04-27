import "../../register.js";

import { EmbCommandPalette, type CommandPaletteCommand } from "./emb-command-palette.js";

describe("emb-command-palette", () => {
  const commands: CommandPaletteCommand[] = [
    { description: "Create a new note", keywords: ["write", "document"], label: "New note", shortcut: "N", value: "new-note" },
    { description: "Search across notes", keywords: ["find"], label: "Search notes", shortcut: "/", value: "search-notes" },
    { description: "Open settings", keywords: ["preferences"], label: "Settings", shortcut: "S", value: "settings" }
  ];

  it("filters commands from the search query", async () => {
    const element = document.createElement("emb-command-palette") as EmbCommandPalette;
    element.commands = commands;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const search = element.renderRoot.querySelector("emb-search") as unknown as {
      value: string;
      dispatchEvent: (event: Event) => boolean;
    };
    search.value = "settings";
    search.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll("emb-option");
    expect(options).toHaveLength(1);
    expect(options[0]?.getAttribute("value")).toBe("settings");
  });

  it("selects the active command with Enter and closes the palette", async () => {
    const element = document.createElement("emb-command-palette") as EmbCommandPalette;
    element.commands = commands;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const onSelect = vi.fn();
    element.addEventListener("command-select", onSelect);

    const surface = element.renderRoot.querySelector(".surface") as HTMLElement;
    surface.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowDown" }));
    surface.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));
    await element.updateComplete;

    expect(element.value).toBe("search-notes");
    expect(element.open).toBe(false);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ value: "search-notes" })
      })
    );
  });
});
