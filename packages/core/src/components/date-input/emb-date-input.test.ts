import "../../register.js";

import { EmbDateInput } from "./emb-date-input.js";

describe("emb-date-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a native date input", async () => {
    const element = document.createElement("emb-date-input") as EmbDateInput;
    element.value = "2026-04-26";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("2026-04-26");
    expect(input?.getAttribute("type")).toBe("date");
  });

  it("inherits reset, constraints, and accessibility forwarding from the base input", async () => {
    const element = document.createElement("emb-date-input") as EmbDateInput;
    element.setAttribute("value", "2026-04-26");
    element.value = "2026-04-26";
    element.min = "2026-04-01";
    element.max = "2026-04-30";
    element.required = true;
    element.setAttribute("aria-label", "Due date");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.min).toBe("2026-04-01");
    expect(input.max).toBe("2026-04-30");
    expect(input.required).toBe(true);
    expect(input.getAttribute("aria-label")).toBe("Due date");

    input.value = "2026-04-28";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("2026-04-28");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("2026-04-26");
    expect(input.value).toBe("2026-04-26");
  });
});
