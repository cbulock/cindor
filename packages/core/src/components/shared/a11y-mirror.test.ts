import { ReferencedTextObserver, resolveReferencedText } from "./a11y-mirror.js";

describe("ReferencedTextObserver", () => {
  const observers: ReferencedTextObserver[] = [];
  const settle = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); };
  function watch(host: HTMLElement, reference = "label") {
    const changes: string[] = [];
    const observer = new ReferencedTextObserver(host, () => changes.push(resolveReferencedText(host, reference)));
    observers.push(observer);
    observer.observe(reference);
    return { observer, changes };
  }
  beforeEach(() => { document.body.innerHTML = '<span id="label">Original</span><div id="host"></div>'; });
  afterEach(() => { observers.forEach((observer) => observer.disconnect()); observers.length = 0; document.body.innerHTML = ""; });

  it("ignores unrelated additions, removals, text and id changes", async () => {
    const { changes } = watch(document.getElementById("host")!);
    const unrelated = document.createElement("section");
    unrelated.innerHTML = '<span id="other">Unrelated</span>';
    document.body.append(unrelated);
    await settle();
    unrelated.firstElementChild!.id = "another";
    unrelated.firstElementChild!.textContent = "Changed";
    await settle();
    unrelated.remove();
    await settle();
    expect(changes).toEqual([]);
  });

  it("discovers a late reference and keeps observing its text", async () => {
    const { changes } = watch(document.getElementById("host")!, "late");
    const label = document.createElement("span");
    label.id = "late";
    label.textContent = "Arrived";
    document.body.append(label);
    await settle();
    label.firstChild!.textContent = "Edited";
    await settle();
    expect(changes).toEqual(["Arrived", "Edited"]);
  });

  it("rebinds after replacement, removal and reinsertion", async () => {
    const { changes } = watch(document.getElementById("host")!);
    const replacement = document.createElement("span");
    replacement.id = "label";
    replacement.textContent = "Replacement";
    document.getElementById("label")!.replaceWith(replacement);
    await settle();
    replacement.firstChild!.textContent = "Edited replacement";
    await settle();
    replacement.remove();
    await settle();
    document.body.append(replacement);
    await settle();
    expect(changes).toEqual(["Replacement", "Edited replacement", "", "Edited replacement"]);
  });

  it("discovers renamed ids and releases old references", async () => {
    const { changes } = watch(document.getElementById("host")!);
    document.getElementById("label")!.id = "old";
    await settle();
    expect(changes).toEqual([""]);
    const label = document.createElement("span");
    label.textContent = "New identity";
    document.body.append(label);
    await settle();
    label.id = "label";
    await settle();
    document.getElementById("old")!.textContent = "No longer referenced";
    await settle();
    expect(changes).toEqual(["", "New identity"]);
  });

  it("observes the winning shadow reference and falls back to document scope", async () => {
    const root = document.getElementById("host")!.attachShadow({ mode: "open" });
    root.innerHTML = '<span id="label">Shadow label</span><div></div>';
    const { changes } = watch(root.lastElementChild as HTMLElement);
    document.getElementById("label")!.textContent = "Document fallback";
    await settle();
    root.getElementById("label")!.remove();
    await settle();
    document.getElementById("label")!.firstChild!.textContent = "Updated fallback";
    await settle();
    expect(changes).toEqual(["Document fallback", "Updated fallback"]);
  });

  it("tracks references in the assigned slot scope", async () => {
    const container = document.getElementById("host")!;
    const root = container.attachShadow({ mode: "open" });
    root.innerHTML = '<span id="label">Slotted label</span><slot></slot>';
    const host = document.createElement("div");
    container.append(host);
    const { changes } = watch(host);
    root.getElementById("label")!.textContent = "Updated slotted label";
    await settle();
    expect(changes).toEqual(["Updated slotted label"]);
  });

  it("follows slot reassignment and discovers a newly matching slot", async () => {
    const container = document.getElementById("host")!;
    const root = container.attachShadow({ mode: "open" });
    root.innerHTML = '<span id="label">Slotted label</span><slot></slot>';
    const host = document.createElement("div");
    container.append(host);
    const { changes } = watch(host);
    await settle();
    host.slot = "later";
    await settle();
    expect(changes).toEqual(["Original"]);
    const slot = document.createElement("slot");
    slot.name = "later";
    root.append(slot);
    await settle();
    expect(changes).toEqual(["Original", "Slotted label"]);
  });

  it("rebinds a replacement even when its text has not changed", async () => {
    const { changes } = watch(document.getElementById("host")!);
    const replacement = document.createElement("span");
    replacement.id = "label";
    replacement.textContent = "Original";
    document.getElementById("label")!.replaceWith(replacement);
    await settle();
    expect(changes).toEqual([]);
    replacement.firstChild!.textContent = "New text";
    await settle();
    expect(changes).toEqual(["New text"]);
  });
  it("stops after disconnect and resumes on observe with changed references", async () => {
    const { observer, changes } = watch(document.getElementById("host")!);
    observer.disconnect();
    document.getElementById("label")!.textContent = "While disconnected";
    await settle();
    expect(changes).toEqual([]);
    observer.observe("label");
    document.getElementById("label")!.textContent = "After reconnect";
    await settle();
    expect(changes).toEqual(["After reconnect"]);
    observer.observe("other");
    document.getElementById("label")!.textContent = "Old reference";
    await settle();
    expect(changes).toEqual(["After reconnect"]);
  });
});
