import "../../register.js";

import { CindorJsonViewer } from "./cindor-json-viewer.js";

describe("cindor-json-viewer", () => {
  it("renders direct data assignments and keeps nested collections collapsed by default", async () => {
    const element = document.createElement("cindor-json-viewer") as CindorJsonViewer;
    element.rootLabel = "Response";
    element.data = {
      payload: {
        status: "ok"
      },
      requestId: "req_1024"
    };
    document.body.append(element);
    await element.updateComplete;

    const details = Array.from(element.renderRoot.querySelectorAll("details"));

    expect(details).toHaveLength(2);
    expect(details[0]?.open).toBe(true);
    expect(details[1]?.open).toBe(false);
    expect(element.renderRoot.textContent).toContain("requestId");
    expect(element.renderRoot.textContent).toContain("\"req_1024\"");
  });

  it("expands nested collections through the configured depth", async () => {
    const element = document.createElement("cindor-json-viewer") as CindorJsonViewer;
    element.expandedDepth = 2;
    element.data = {
      payload: {
        items: [1, 2, 3]
      }
    };
    document.body.append(element);
    await element.updateComplete;

    const details = Array.from(element.renderRoot.querySelectorAll("details"));

    expect(details[0]?.open).toBe(true);
    expect(details[1]?.open).toBe(true);
    expect(details[2]?.open).toBe(false);
  });

  it("parses JSON strings when no direct data is assigned", async () => {
    const element = document.createElement("cindor-json-viewer") as CindorJsonViewer;
    element.value = '{"event":"deploy","healthy":true}';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.textContent).toContain("event");
    expect(element.renderRoot.textContent).toContain("\"deploy\"");
    expect(element.renderRoot.textContent).toContain("healthy");
    expect(element.renderRoot.textContent).toContain("true");
  });

  it("renders an invalid state for malformed JSON strings", async () => {
    const element = document.createElement("cindor-json-viewer") as CindorJsonViewer;
    element.value = "{not valid json";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="invalid"]')?.textContent).toContain("Unable to parse JSON.");
  });

  it("prefers direct data over the string value when both are present", async () => {
    const element = document.createElement("cindor-json-viewer") as CindorJsonViewer;
    element.value = '{"source":"string"}';
    element.data = { source: "object" };
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.textContent).toContain("\"object\"");
    expect(element.renderRoot.textContent).not.toContain("\"string\"");
  });
});
