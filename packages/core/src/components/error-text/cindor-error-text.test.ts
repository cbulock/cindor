import "../../register.js";

describe("cindor-error-text", () => {
  it("renders alert semantics for error content", async () => {
    const element = document.createElement("cindor-error-text");
    element.textContent = "Something went wrong";
    document.body.append(element);

    await (element as HTMLElement & { updateComplete: Promise<void> }).updateComplete;

    const alert = element.shadowRoot?.querySelector('[role="alert"]');

    expect(alert).not.toBeNull();
    expect(element.textContent).toContain("Something went wrong");
  });
});
