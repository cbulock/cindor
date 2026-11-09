import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  server: { host: "127.0.0.1", port: 0 },
  plugins: [{
    name: "a11y-test-page",
    configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        if (req.url !== "/") return next();
        res.setHeader("Content-Type", "text/html");
        res.end("<!doctype html><title>Accessibility observation regression</title><body></body>");
      });
    }
  }]
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const page = await browser.newPage();
  await page.goto(server.resolvedUrls.local[0]);
  const result = await page.evaluate(async () => {
    const { document, customElements } = globalThis;
    const { CindorInput } = await import("/packages/core/src/components/input/cindor-input.ts");
    let updates = 0;
    class ObservedInput extends CindorInput {
      updated(changed) { super.updated(changed); updates++; }
    }
    customElements.define("observed-a11y-input", ObservedInput);
    const settle = async () => { await new Promise((resolve) => setTimeout(resolve, 30)); };
    const label = document.createElement("span");
    label.id = "shared-label";
    label.textContent = "Original";
    document.body.append(label);
    const inputs = Array.from({ length: 100 }, () => {
      const input = document.createElement("observed-a11y-input");
      input.setAttribute("aria-labelledby", label.id);
      document.body.append(input);
      return input;
    });
    await settle();
    updates = 0;
    document.body.append(document.createElement("div"));
    await settle();
    const unrelatedUpdates = updates;
    updates = 0;
    label.firstChild.data = "Updated";
    await settle();
    const textUpdates = updates;
    const textCorrect = inputs.every((input) => input.shadowRoot.querySelector("label").textContent.trim() === "Updated");
    inputs.forEach((input) => input.remove());
    updates = 0;
    label.textContent = "Disconnected";
    await settle();
    const disconnectedUpdates = updates;
    document.body.append(inputs[0]);
    await settle();
    label.textContent = "Reconnected";
    await settle();
    const reconnectCorrect = inputs[0].shadowRoot.querySelector("label").textContent.trim() === "Reconnected";
    const { ReferencedTextObserver, resolveReferencedText } = await import("/packages/core/src/components/shared/a11y-mirror.ts");
    const container = document.createElement("div");
    document.body.append(container);
    const root = container.attachShadow({ mode: "open" });
    root.innerHTML = '<span id="shared-label">Shadow label</span><slot></slot>';
    const slotted = document.createElement("div");
    container.append(slotted);
    const slotRemovalChanges = [];
    const observer = new ReferencedTextObserver(slotted, () => slotRemovalChanges.push(resolveReferencedText(slotted, "shared-label")));
    observer.observe("shared-label");
    await settle();
    root.querySelector("slot").remove();
    await settle();
    label.firstChild.data = "Fallback edit";
    await settle();
    observer.disconnect();

    const { CindorButton } = await import("/packages/core/src/components/button/cindor-button.ts");
    let buttonUpdates = 0;
    class ObservedButton extends CindorButton {
      updated(changed) { super.updated(changed); buttonUpdates++; }
    }
    customElements.define("observed-a11y-button", ObservedButton);
    const button = document.createElement("observed-a11y-button");
    button.setAttribute("aria-labelledby", "shared-label");
    document.body.append(button);
    await settle();
    button.requestUpdate();
    button.remove();
    await settle();
    buttonUpdates = 0;
    label.firstChild.data = "Detached button edit";
    await settle();
    const detachedButtonUpdates = buttonUpdates;
    document.body.append(button);
    await settle();
    buttonUpdates = 0;
    label.firstChild.data = "Reconnected button edit";
    await settle();
    const reconnectedButtonUpdates = buttonUpdates;
    return { unrelatedUpdates, textUpdates, textCorrect, disconnectedUpdates, reconnectCorrect, slotRemovalChanges, detachedButtonUpdates, reconnectedButtonUpdates };
  });
  console.log(JSON.stringify(result, null, 2));
  assert.equal(result.unrelatedUpdates, 0, "Unrelated mutations must not update 100 labeled inputs");
  assert.equal(result.textUpdates, 100);
  assert.equal(result.textCorrect, true);
  assert.equal(result.disconnectedUpdates, 0);
  assert.equal(result.reconnectCorrect, true);
  assert.deepEqual(result.slotRemovalChanges, ["Reconnected", "Fallback edit"]);
  assert.equal(result.detachedButtonUpdates, 0);
  assert.equal(result.reconnectedButtonUpdates, 1);
} finally {
  await browser?.close();
  await server.close();
}
