/* global document, customElements */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createServer } from "vite";

// Run from the workspace root: node scripts/test-inherited-disabled-browser.mjs
// Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to use a locally installed browser.
const source = await readFile("packages/core/src/register.ts", "utf8");
const tags = [...source.matchAll(/\["(cindor-[^"]+)",/g)].map((match) => match[1]);
const server = await createServer({ configFile: false, appType: "custom", server: { host: "127.0.0.1", port: 0 } });
server.middlewares.use("/__disabled_test", (_request, response) => {
  response.setHeader("Content-Type", "text/html");
  response.end("<!doctype html><html><body></body></html>");
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    headless: true
  });
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto(`${server.resolvedUrls.local[0]}__disabled_test`);
  await page.evaluate(() => import("/packages/core/src/register.ts"));
  const result = await page.evaluate(async (allTags) => {
    const errors = [];
    const check = (condition, message) => { if (!condition) errors.push(message); };
    const settle = async (root) => {
      for (let pass = 0; pass < 5; pass++) {
        const visit = async (node) => {
          if (node.updateComplete) await node.updateComplete;
          for (const child of node.children ?? []) await visit(child);
          if (node.shadowRoot) await visit(node.shadowRoot);
        };
        await visit(root);
      }
    };
    const controls = (root) => {
      const found = [];
      const visit = (node) => {
        if (node.matches?.("input, select, textarea, button")) found.push(node);
        for (const child of node.children ?? []) visit(child);
        if (node.shadowRoot) visit(node.shadowRoot);
      };
      visit(root);
      return found;
    };
    const formEntries = (form) => JSON.stringify([...new FormData(form)].map(([name, value]) => [name,
      typeof value === "string" ? value : { name: value.name, size: value.size, type: value.type }
    ]));
    const formTags = allTags.filter((tag) => customElements.get(tag)?.formAssociated);
    for (const tag of formTags) {
      const form = document.createElement("form");
      const fieldset = document.createElement("fieldset");
      const element = document.createElement(tag);
      element.name = "control";
      if (["cindor-select", "cindor-autocomplete", "cindor-combobox", "cindor-searchable-dropdown", "cindor-multi-select", "cindor-transfer-list"].includes(tag)) {
        element.innerHTML = '<option value="a" selected>Alpha</option><option value="b">Beta</option>';
      }
      if (tag === "cindor-segmented-control") element.options = [{ label: "Alpha", value: "a" }, { label: "Beta", value: "b" }];
      if (tag === "cindor-filter-builder") element.fields = [{ label: "Name", value: "name", type: "text" }];
      if (tag === "cindor-field-array") {
        element.items = [{ label: "First" }, { label: "Second" }];
        element.renderItem = () => {
          const content = document.createElement("div");
          content.innerHTML = '<input aria-label="Native item"><cindor-input aria-label="Custom item"></cindor-input><cindor-input disabled aria-label="Explicitly disabled item"></cindor-input>';
          return content;
        };
      }
      fieldset.append(element); form.append(fieldset); document.body.append(form);
      await settle(form);
      const enabled = controls(element).filter((control) => !control.matches(":disabled"));
      const initialEntries = formEntries(form);
      for (let cycle = 0; cycle < 2; cycle++) {
        fieldset.disabled = true; await settle(form);
        check(element.disabled === false && !element.hasAttribute("disabled"), `${tag}: ancestor disabled reflected to public state`);
        check(element.matches(":disabled"), `${tag}: host is not natively disabled`);
        check([...new FormData(form)].length === 0, `${tag}: disabled control submitted`);
        check(controls(element).every((control) => control.matches(":disabled")), `${tag}: enabled shadow control while fieldset disabled`);
        fieldset.disabled = false; await settle(form);
        check(!element.matches(":disabled"), `${tag}: did not recover after fieldset enabled`);
        check(formEntries(form) === initialEntries, `${tag}: FormData did not recover`);
        check(controls(element).filter((control) => !control.matches(":disabled")).length === enabled.length, `${tag}: shadow control did not recover`);
      }
      element.disabled = true; await settle(form);
      fieldset.disabled = true; await settle(form);
      fieldset.disabled = false; await settle(form);
      check(element.disabled && element.hasAttribute("disabled") && element.matches(":disabled"), `${tag}: lost explicit disabled`);
      element.disabled = false; await settle(form);
      check(!element.matches(":disabled") && controls(element).filter((control) => !control.matches(":disabled")).length === enabled.length, `${tag}: explicit disabled removal did not recover`);
      // Removing an explicit attribute while an ancestor remains disabled must stay disabled.
      fieldset.disabled = true; element.disabled = true; await settle(form);
      element.disabled = false; await settle(form);
      check(element.matches(":disabled") && controls(element).every((control) => control.matches(":disabled")), `${tag}: ancestor disabled lost after explicit removal`);
      fieldset.disabled = false; await settle(form);
      check(!element.matches(":disabled") && controls(element).filter((control) => !control.matches(":disabled")).length === enabled.length, `${tag}: explicit removal under ancestor remained sticky`);
      fieldset.disabled = true; await settle(form);
      form.append(element); await settle(form);
      check(!element.matches(":disabled") && controls(element).filter((control) => !control.matches(":disabled")).length === enabled.length, `${tag}: moving out of disabled fieldset did not recover`);
      check(formEntries(form) === initialEntries, `${tag}: moved control FormData did not recover`);
      form.remove();
    }
    document.body.innerHTML = `<form><fieldset id="outer"><legend><cindor-input name="legend" value="legend"></cindor-input></legend><legend><cindor-input name="second" value="second"></cindor-input></legend><cindor-input name="plain" value="plain" required></cindor-input><fieldset id="inner"><cindor-input name="nested" value="nested"></cindor-input></fieldset></fieldset></form>`;
    const form = document.querySelector("form");
    const outer = document.querySelector("#outer");
    const inner = document.querySelector("#inner");
    await settle(form);
    check(new FormData(form).get("plain") === "plain", "initial FormData missing input");
    outer.disabled = true; await settle(form);
    check(JSON.stringify([...new FormData(form)]) === JSON.stringify([["legend", "legend"]]), "first legend exemption or second legend exclusion failed");
    check(!form.querySelector('[name="legend"]').shadowRoot.querySelector("input").disabled, "first legend native control disabled");
    inner.disabled = true; outer.disabled = false; await settle(form);
    check(new FormData(form).get("plain") === "plain" && !new FormData(form).has("nested"), "nested fieldset disable state lost");
    inner.disabled = false; await settle(form);
    check(new FormData(form).get("nested") === "nested", "nested value did not recover");
    const plain = form.querySelector('[name="plain"]');
    plain.value = ""; await settle(form);
    check(!form.checkValidity(), "required input unexpectedly valid");
    outer.disabled = true; await settle(form);
    check(form.checkValidity(), "disabled required input blocks validity");
    outer.disabled = false; await settle(form);
    check(!form.checkValidity(), "required validity did not recover");
    return { tags: formTags, errors };
  }, tags);
  assert.deepEqual(runtimeErrors, [], "Browser runtime errors");
  assert.deepEqual(result.errors, [], result.errors.join("\n"));
  console.log(`Inherited disabled browser regressions passed for ${result.tags.length} controls, composites, form data, validity and fieldset/legend rules.`);
} finally {
  await browser?.close();
  await server.close();
}
