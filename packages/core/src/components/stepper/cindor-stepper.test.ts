import "../../register.js";

import { CindorStepper, type StepperStep } from "./cindor-stepper.js";

describe("cindor-stepper", () => {
  const steps: StepperStep[] = [
    { description: "Tell us about the project", label: "Project details", value: "details" },
    { description: "Configure access and invites", label: "Team", value: "team" },
    { description: "Review and launch", label: "Launch", value: "launch" }
  ];

  it("defaults to the first step when no value is provided", async () => {
    const element = document.createElement("cindor-stepper") as CindorStepper;
    element.steps = steps;
    document.body.append(element);
    await element.updateComplete;

    expect(element.value).toBe("details");
    expect(element.renderRoot.querySelector('[aria-current="step"]')?.textContent).toContain("Project details");
  });

  it("updates the current step when an interactive step is clicked", async () => {
    const element = document.createElement("cindor-stepper") as CindorStepper;
    element.interactive = true;
    element.steps = steps;
    document.body.append(element);
    await element.updateComplete;

    const buttons = element.renderRoot.querySelectorAll("button");
    buttons[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.value).toBe("team");
  });
});
