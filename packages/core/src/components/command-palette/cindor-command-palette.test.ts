import "../../register.js";

import { CindorCommandPalette, type CommandPaletteCommand } from "./cindor-command-palette.js";

describe("cindor-command-palette", () => {
  const commands: CommandPaletteCommand[] = [
    { description: "Create a new note", keywords: ["write", "document"], label: "New note", shortcut: "N", value: "new-note" },
    { description: "Search across notes", keywords: ["find"], label: "Search notes", shortcut: "/", value: "search-notes" },
    { description: "Open settings", keywords: ["preferences"], label: "Settings", shortcut: "S", value: "settings" }
  ];

  it("filters commands from the search query", async () => {
    const element = document.createElement("cindor-command-palette") as CindorCommandPalette;
    element.commands = commands;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const search = element.renderRoot.querySelector("cindor-search") as unknown as {
      value: string;
      dispatchEvent: (event: Event) => boolean;
    };
    search.value = "settings";
    search.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll("cindor-option");
    expect(options).toHaveLength(1);
    expect(options[0]?.getAttribute("value")).toBe("settings");
  });

  it("selects the active command with Enter and closes the palette", async () => {
    const element = document.createElement("cindor-command-palette") as CindorCommandPalette;
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
