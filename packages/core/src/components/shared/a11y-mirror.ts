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

const rootObservers = new WeakMap<Document | ShadowRoot, ReferenceRootObserver>();
type ReferenceListener = () => void;

// Discovery is shared per tree and indexed by ID. Unrelated mutations never
// fan out to component observers; text changes are observed on the targets.
class ReferenceRootObserver {
  private readonly listeners = new Map<string, Set<ReferenceListener>>();
  private readonly mutationObserver: MutationObserver;
  private readonly onSlotChange = (): void => {
    const listeners = new Set([...this.listeners.values()].flatMap((entries) => [...entries]));
    for (const listener of listeners) listener();
  };

  constructor(private readonly root: Document | ShadowRoot) {
    this.mutationObserver = new MutationObserver((records) => {
      const affected = new Set<ReferenceListener>();
      const collectId = (id: string | null): void => {
        if (id) for (const listener of this.listeners.get(id) ?? []) affected.add(listener);
      };
      const collectNode = (node: Node): void => {
        if (!(node instanceof Element)) return;
        // A removed slot no longer bubbles slotchange to its old root.
        // Refresh scope subscribers when slots (or their ancestors) move.
        if (root instanceof ShadowRoot && (node.localName === "slot" || node.querySelector("slot"))) {
          for (const listeners of this.listeners.values()) {
            for (const listener of listeners) affected.add(listener);
          }
        }
        collectId(node.id);
        for (const element of node.querySelectorAll("[id]")) collectId(element.id);
      };
      for (const record of records) {
        if (record.type === "attributes") {
          collectId(record.oldValue);
          collectId((record.target as Element).id);
        } else {
          for (const node of record.addedNodes) collectNode(node);
          for (const node of record.removedNodes) collectNode(node);
        }
      }
      for (const listener of affected) listener();
    });
    this.mutationObserver.observe(root, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["id"], attributeOldValue: true
    });
    root.addEventListener("slotchange", this.onSlotChange);
  }

  subscribe(ids: Set<string>, listener: ReferenceListener): () => void {
    for (const id of ids) {
      const listeners = this.listeners.get(id) ?? new Set<ReferenceListener>();
      listeners.add(listener);
      this.listeners.set(id, listeners);
    }
    return () => {
      for (const id of ids) {
        const listeners = this.listeners.get(id);
        listeners?.delete(listener);
        if (listeners?.size === 0) this.listeners.delete(id);
      }
      if (this.listeners.size === 0) {
        this.mutationObserver.disconnect();
        this.root.removeEventListener("slotchange", this.onSlotChange);
        rootObservers.delete(this.root);
      }
    };
  }
}

export class ReferencedTextObserver {
  private readonly mutationObserver = new MutationObserver(() => this.refresh());
  private readonly subscriptions = new Map<Document | ShadowRoot, () => void>();
  private attributeValues: ReferenceValue[] = [];
  private ids = new Set<string>();
  private text: string[] = [];
  private active = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly onChange: () => void
  ) {}

  observe(...attributeValues: ReferenceValue[]): void {
    this.disconnect();
    // Lit may finish an already queued update after disconnectedCallback.
    if (!this.host.isConnected) return;
    this.attributeValues = attributeValues;
    this.ids = new Set(attributeValues.flatMap((value) => value?.split(/\s+/).filter(Boolean) ?? []));
    if (this.ids.size === 0) return;
    this.active = true;
    this.text = this.resolveText();
    this.observeTargets();
  }

  disconnect(): void {
    this.active = false;
    this.mutationObserver.disconnect();
    for (const unsubscribe of this.subscriptions.values()) unsubscribe();
    this.subscriptions.clear();
    this.attributeValues = [];
    this.ids.clear();
    this.text = [];
  }

  private readonly refresh = (): void => {
    if (!this.active) return;
    this.observeTargets();
    const text = this.resolveText();
    const changed = text.some((value, index) => value !== this.text[index]);
    this.text = text;
    if (changed) this.onChange();
  };

  private resolveText(): string[] {
    return this.attributeValues.map((value) => resolveReferencedText(this.host, value ?? null));
  }

  private observeTargets(): void {
    const roots = getReferenceRoots(this.host);
    // Keep discovery in possible slot scopes even while the host has no matching slot.
    const discoveryRoots = new Set(roots);
    const addSlotScope = (element: Element): void => {
      const root = element.parentElement?.shadowRoot;
      if (root) discoveryRoots.add(root);
    };
    addSlotScope(this.host);
    for (const root of roots) if (root instanceof ShadowRoot) addSlotScope(root.host);
    for (const [root, unsubscribe] of this.subscriptions) {
      if (!discoveryRoots.has(root)) {
        unsubscribe();
        this.subscriptions.delete(root);
      }
    }
    for (const root of discoveryRoots) {
      if (this.subscriptions.has(root)) continue;
      let observer = rootObservers.get(root);
      if (!observer) {
        observer = new ReferenceRootObserver(root);
        rootObservers.set(root, observer);
      }
      this.subscriptions.set(root, observer.subscribe(this.ids, this.refresh));
    }

    this.mutationObserver.disconnect();
    const targets = new Set<Element>();
    for (const id of this.ids) {
      for (const root of roots) {
        const target = root.getElementById(id);
        if (!target) continue;
        targets.add(target);
        break;
      }
    }
    for (const target of targets) {
      this.mutationObserver.observe(target, { characterData: true, childList: true, subtree: true });
    }
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
