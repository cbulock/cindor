import "../../register.js";

import { EmbEmailInput } from "./emb-email-input.js";

describe("emb-email-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a native email input", async () => {
    const element = document.createElement("emb-email-input") as EmbEmailInput;
    element.value = "hello@example.com";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("hello@example.com");
    expect(input?.getAttribute("type")).toBe("email");
  });

  it("applies email autocomplete and supports reset plus aria forwarding", async () => {
    const element = document.createElement("emb-email-input") as EmbEmailInput;
    element.setAttribute("value", "hello@example.com");
    element.value = "hello@example.com";
    element.required = true;
    element.setAttribute("aria-label", "Email address");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.autocomplete).toBe("email");
    expect(input.required).toBe(true);
    expect(input.getAttribute("aria-label")).toBe("Email address");

    input.value = "updated@example.com";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("updated@example.com");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("hello@example.com");
    expect(input.value).toBe("hello@example.com");
  });
});
