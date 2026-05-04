const visuallyHiddenStyles = [
  "position:absolute",
  "inline-size:1px",
  "block-size:1px",
  "padding:0",
  "margin:-1px",
  "overflow:hidden",
  "clip:rect(0 0 0 0)",
  "white-space:nowrap",
  "border:0"
].join(";");

type ReferenceValue = string | null | undefined;

export function normalizeA11yText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function resolveReferencedText(host: HTMLElement, attributeValue: string | null): string {
  if (!attributeValue) {
    return "";
  }

  const resolvedText = attributeValue
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token !== "")
    .map((token) => findReferenceText(token, getReferenceRoots(host)))
    .filter((text) => text !== "");

  return normalizeA11yText(resolvedText.join(" "));
}

export function syncA11yMirror(
  container: DocumentFragment | Element,
  idBase: string,
  kind: "description" | "label",
  text: string
): string | null {
  const mirrorRoot = getA11yMirrorRoot(container);
  const selector = `[data-cindor-a11y="${kind}"][data-cindor-a11y-base="${idBase}"]`;
  const existingMirror = mirrorRoot.querySelector(selector);

  if (text === "") {
    existingMirror?.remove();
    return null;
  }

  const mirrorId = `${idBase}-${kind}`;
  const mirror = existingMirror instanceof HTMLSpanElement ? existingMirror : document.createElement("span");
  mirror.dataset.cindorA11y = kind;
  mirror.dataset.cindorA11yBase = idBase;
  mirror.id = mirrorId;
  mirror.setAttribute("style", visuallyHiddenStyles);
  mirror.textContent = text;

  if (mirror.parentElement !== mirrorRoot) {
    mirrorRoot.append(mirror);
  }

  return mirrorId;
}

export class ReferencedTextObserver {
  private readonly mutationObserver: MutationObserver;
  private readonly observedNodes = new Set<Node>();

  constructor(
    private readonly host: HTMLElement,
    private readonly onChange: () => void
  ) {
    this.mutationObserver = new MutationObserver(() => {
      this.onChange();
    });
  }

  observe(...attributeValues: ReferenceValue[]): void {
    this.disconnect();

    const roots = getReferenceRoots(this.host);
    const referencedElements = attributeValues.flatMap((attributeValue) => getReferenceElements(this.host, attributeValue));
    if (referencedElements.length === 0) {
      return;
    }

    for (const root of roots) {
      this.observeNode(root, { childList: true, subtree: true });
    }

    for (const element of referencedElements) {
      this.observeNode(element, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
  }

  disconnect(): void {
    this.mutationObserver.disconnect();
    this.observedNodes.clear();
  }

  private observeNode(node: Node, options: MutationObserverInit): void {
    if (this.observedNodes.has(node)) {
      return;
    }

    this.observedNodes.add(node);
    this.mutationObserver.observe(node, options);
  }
}

function findReferenceText(id: string, roots: Array<Document | ShadowRoot>): string {
  for (const root of roots) {
    const element = root.getElementById(id);
    if (element) {
      return normalizeA11yText(element.textContent);
    }
  }

  return "";
}

function getReferenceElements(host: HTMLElement, attributeValue: ReferenceValue): HTMLElement[] {
  if (!attributeValue) {
    return [];
  }

  const roots = getReferenceRoots(host);
  const elements: HTMLElement[] = [];
  const seenElements = new Set<HTMLElement>();

  for (const token of attributeValue.split(/\s+/).map((value) => value.trim()).filter((value) => value !== "")) {
    for (const root of roots) {
      const element = root.getElementById(token);
      if (!(element instanceof HTMLElement) || seenElements.has(element)) {
        continue;
      }

      seenElements.add(element);
      elements.push(element);
    }
  }

  return elements;
}

function getReferenceRoots(host: HTMLElement): Array<Document | ShadowRoot> {
  const roots: Array<Document | ShadowRoot> = [];
  const seenRoots = new Set<Document | ShadowRoot>();

  const pushRoot = (root: Document | ShadowRoot | null): void => {
    if (!root || seenRoots.has(root)) {
      return;
    }

    seenRoots.add(root);
    roots.push(root);
  };

  let slot: HTMLSlotElement | null = host.assignedSlot;
  while (slot) {
    const slotRoot = slot.getRootNode();
    pushRoot(slotRoot instanceof ShadowRoot ? slotRoot : slotRoot instanceof Document ? slotRoot : null);

    const ownerHost = slotRoot instanceof ShadowRoot ? slotRoot.host : null;
    slot = ownerHost?.assignedSlot ?? null;
  }

  const ownRoot = host.getRootNode();
  pushRoot(ownRoot instanceof ShadowRoot ? ownRoot : ownRoot instanceof Document ? ownRoot : null);
  pushRoot(host.ownerDocument);

  return roots;
}

function getA11yMirrorRoot(container: DocumentFragment | Element): HTMLDivElement {
  const existingRoot = container.querySelector('[data-cindor-a11y-root="true"]');
  if (existingRoot instanceof HTMLDivElement) {
    return existingRoot;
  }

  const mirrorRoot = document.createElement("div");
  mirrorRoot.dataset.cindorA11yRoot = "true";
  mirrorRoot.setAttribute("aria-hidden", "true");
  container.append(mirrorRoot);
  return mirrorRoot;
}
