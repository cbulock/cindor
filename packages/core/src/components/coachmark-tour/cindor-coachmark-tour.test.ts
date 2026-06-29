import "../../register.js";

import { CindorCoachmarkTour, type CoachmarkTourStep } from "./cindor-coachmark-tour.js";

describe("cindor-coachmark-tour", () => {
  const steps: CoachmarkTourStep[] = [
    {
      description: "Use quick filters to narrow the current view.",
      target: "#filters",
      title: "Start with filters"
    },
    {
      description: "Open the inspector to adjust the current selection.",
      target: "#inspector",
      title: "Check the inspector"
    }
  ];

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function setupTargets() {
    document.body.innerHTML = `
      <button id="launcher">Start tour</button>
      <div id="filters">Filters</div>
      <div id="inspector">Inspector</div>
    `;
  }

  it("renders the current step and highlights its target", async () => {
    setupTargets();

    const element = document.createElement("cindor-coachmark-tour") as CindorCoachmarkTour;
    element.steps = steps;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="title"]')?.textContent).toContain("Start with filters");
    expect(element.renderRoot.querySelector('[part="spotlight"]')).not.toBeNull();
  });

  it("moves forward and backward through the step sequence", async () => {
    setupTargets();

    const element = document.createElement("cindor-coachmark-tour") as CindorCoachmarkTour;
    element.steps = steps;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const onStepChange = vi.fn();
    element.addEventListener("step-change", onStepChange);

    (element.renderRoot.querySelector('[part="next-button"]') as HTMLButtonElement).click();
    await element.updateComplete;
    expect(element.currentStep).toBe(1);

    (element.renderRoot.querySelector('[part="previous-button"]') as HTMLButtonElement).click();
    await element.updateComplete;
    expect(element.currentStep).toBe(0);
    expect(onStepChange).toHaveBeenCalled();
  });

  it("completes on the last step and restores focus", async () => {
    setupTargets();

    const launcher = document.getElementById("launcher") as HTMLButtonElement;
    launcher.focus();

    const element = document.createElement("cindor-coachmark-tour") as CindorCoachmarkTour;
    element.steps = steps;
    element.currentStep = 1;
    element.open = true;
    element.currentStep = 1;
    document.body.append(element);
    await element.updateComplete;

    const onComplete = vi.fn();
    element.addEventListener("complete", onComplete);

    (element.renderRoot.querySelector('[part="next-button"]') as HTMLButtonElement).click();
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(launcher);
  });

  it("closes on Escape and emits close", async () => {
    setupTargets();

    const element = document.createElement("cindor-coachmark-tour") as CindorCoachmarkTour;
    element.steps = steps;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const onClose = vi.fn();
    element.addEventListener("close", onClose);

    (element.renderRoot.querySelector('[part="surface"]') as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Escape" })
    );
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps tab focus inside the dialog controls and exposes modal semantics", async () => {
    setupTargets();

    const element = document.createElement("cindor-coachmark-tour") as CindorCoachmarkTour;
    element.steps = steps;
    element.currentStep = 1;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const previousButton = element.renderRoot.querySelector('[part="previous-button"]') as HTMLButtonElement;
    const nextButton = element.renderRoot.querySelector('[part="next-button"]') as HTMLButtonElement;
    const tabPreventDefault = vi.fn();
    const shiftTabPreventDefault = vi.fn();

    (
      element as unknown as {
        handleKeyDown: (event: KeyboardEvent) => void;
      }
    ).handleKeyDown({
      key: "Tab",
      preventDefault: tabPreventDefault,
      shiftKey: false,
      target: nextButton
    } as unknown as KeyboardEvent);
    expect(tabPreventDefault).toHaveBeenCalledTimes(1);

    (
      element as unknown as {
        handleKeyDown: (event: KeyboardEvent) => void;
      }
    ).handleKeyDown({
      key: "Tab",
      preventDefault: shiftTabPreventDefault,
      shiftKey: true,
      target: previousButton
    } as unknown as KeyboardEvent);
    expect(shiftTabPreventDefault).toHaveBeenCalledTimes(1);

    const surface = element.renderRoot.querySelector('[part="surface"]') as HTMLElement;
    expect(surface.getAttribute("aria-modal")).toBe("true");
  });

  it("falls back to a centered dialog when the target cannot be found", async () => {
    const element = document.createElement("cindor-coachmark-tour") as CindorCoachmarkTour;
    element.steps = [
      {
        description: "The selector does not exist in the document.",
        target: "#missing",
        title: "Missing target"
      }
    ];
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="target-note"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[part="backdrop"]')).not.toBeNull();
  });

  it("keeps using the active step placement during auto-updates for same-target steps", async () => {
    document.body.innerHTML = `<div id="filters">Filters</div>`;

    const element = document.createElement("cindor-coachmark-tour") as CindorCoachmarkTour;
    let latestAutoUpdateCallback: (() => void) | undefined;
    const positionSpy = vi.fn();
    (
      element as unknown as {
        autoUpdatePosition: (target: HTMLElement, surface: HTMLElement, update: () => void) => () => void;
        positionAgainstTarget: (target: HTMLElement, surface: HTMLElement, placement: string) => Promise<void>;
      }
    ).autoUpdatePosition = (_target, _surface, update) => {
      latestAutoUpdateCallback = update;
      return () => undefined;
    };
    (
      element as unknown as {
        positionAgainstTarget: (target: HTMLElement, surface: HTMLElement, placement: string) => Promise<void>;
      }
    ).positionAgainstTarget = async (target, surface, placement) => {
      positionSpy(target, surface, placement);
    };
    element.steps = [
      {
        description: "First placement on the shared target.",
        placement: "top",
        target: "#filters",
        title: "Shared target top"
      },
      {
        description: "Second placement on the shared target.",
        placement: "bottom",
        target: "#filters",
        title: "Shared target bottom"
      }
    ];
    element.open = true;
    document.body.append(element);
    await element.updateComplete;
    await vi.waitFor(() => {
      expect(positionSpy).toHaveBeenCalledWith(expect.any(HTMLElement), expect.any(HTMLElement), "top");
    });

    element.next();
    await element.updateComplete;
    await vi.waitFor(() => {
      expect(positionSpy).toHaveBeenLastCalledWith(expect.any(HTMLElement), expect.any(HTMLElement), "bottom");
    });
    positionSpy.mockClear();

    latestAutoUpdateCallback?.();
    await vi.waitFor(() => {
      expect(positionSpy).toHaveBeenCalledWith(expect.any(HTMLElement), expect.any(HTMLElement), "bottom");
    });
  });
});
