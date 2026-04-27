import "../../register.js";

describe("emb-helper-text", () => {
  it("renders slotted helper content", async () => {
    const element = document.createElement("emb-helper-text");
    element.textContent = "Helpful guidance";
    document.body.append(element);

    await (element as HTMLElement & { updateComplete: Promise<void> }).updateComplete;

    expect(element.textContent).toContain("Helpful guidance");
  });
});
