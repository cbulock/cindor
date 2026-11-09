/* global document, customElements */
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  server: { host: "127.0.0.1", port: 0 },
  plugins: [{
    name: "form-ownership-regression",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/form-regression")) {
          res.setHeader("Content-Type", "text/html");
          res.end('<!doctype html><script type="module" src="/packages/core/src/register.ts"></script>');
        } else if (req.url?.startsWith("/submitted")) {
          res.end("Submitted");
        } else next();
      });
    }
  }]
});
await server.listen();
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CINDOR_BROWSER_EXECUTABLE || undefined });
  const page = await browser.newPage();
  await page.goto(`${server.resolvedUrls.local[0]}form-regression`);
  await page.evaluate(() => customElements.whenDefined("cindor-form"));
  for (const nested of [false, true]) {
    const result = await page.evaluate(async (nested) => {
      const equal = (actual, expected, label) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
      };
      const settle = async (host) => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await Promise.all([host, ...host.querySelectorAll("*")].map((el) => el.updateComplete));
      };
      const host = document.createElement("cindor-form");
      const fields = '<div><input name="native" value="Native"><cindor-input name="custom" value="Cindor"></cindor-input></div><input name="disabled" value="omit" disabled><button name="intent" value="save" type="submit">Save</button><cindor-button type="submit">Custom save</cindor-button>';
      host.innerHTML = nested ? `<form>${fields}</form>` : fields;
      document.body.append(host);
      await settle(host);
      const form = host.querySelector("form") ?? host.shadowRoot.querySelector("form");
      const input = host.querySelector("input");
      const custom = host.querySelector("cindor-input");
      const initial = [...new FormData(form)];
      input.value = "Changed";
      custom.value = "Changed";
      await settle(host);
      host.reset();
      await settle(host);
      const reset = [...new FormData(form)];
      equal(input.value, "Native", "native reset");
      equal(custom.value, "Cindor", "custom reset");

      input.value = "Keep";
      custom.value = "Keep";
      host.addEventListener("reset", (event) => event.preventDefault(), { once: true });
      host.reset();
      await settle(host);
      equal([input.value, custom.value], ["Keep", "Keep"], "canceled reset");
      host.reset();
      await settle(host);

      let submissions = 0;
      let submitter;
      const onSubmit = (event) => { submissions++; submitter = event.submitter; event.preventDefault(); };
      host.addEventListener("submit", onSubmit);
      const button = host.querySelector("button");
      button.click();
      equal(submissions, 1, "one native button submit");
      equal(submitter === button, true, "native submitter identity");
      equal([...new FormData(form, button)], [["native", "Native"], ["custom", "Cindor"], ["intent", "save"]], "submitter form value");
      host.querySelector("cindor-button").click();
      equal(submissions, 2, "one custom button submit");
      host.requestSubmit(button);
      equal(submissions, 3, "requestSubmit submitter");
      equal(submitter === button, true, "requestSubmit identity");

      input.required = true;
      input.value = "";
      host.requestSubmit(button);
      equal(submissions, 3, "invalid blocks requestSubmit");
      button.formNoValidate = true;
      host.requestSubmit(button);
      equal(submissions, 4, "formnovalidate bypass");
      button.formNoValidate = false;
      input.value = "Native";
      await settle(host);

      let formdataCount = 0;
      host.addEventListener("formdata", (event) => { formdataCount++; event.formData.set("source", "host"); }, { once: true });
      equal(new FormData(form).get("source"), "host", "mutable formdata event");
      equal(formdataCount, 1, "one formdata event");

      const external = document.createElement("form");
      external.id = `external-${nested}`;
      document.body.append(external);
      const elsewhere = document.createElement("input");
      elsewhere.name = "elsewhere";
      elsewhere.required = true;
      elsewhere.setAttribute("form", external.id);
      host.querySelector("div").append(elsewhere);
      await settle(host);
      equal(host.checkValidity(), true, "external control excluded from validation");
      host.submitting = true;
      await settle(host);
      equal(elsewhere.disabled, false, "external control excluded from submitting state");
      const temporary = document.createElement("input");
      host.querySelector("div").append(temporary);
      await settle(host);
      equal(temporary.disabled, true, "dynamic control disabled while submitting");
      temporary.remove();
      await settle(host);
      equal(temporary.disabled, false, "removed control released from submitting state");
      host.submitting = false;
      await settle(host);
      equal(elsewhere.getAttribute("form"), external.id, "external owner preserved");
      equal(new FormData(form).has("disabled"), false, "disabled omitted");

      const dynamic = document.createElement("input");
      dynamic.name = "dynamic";
      dynamic.value = "Added";
      host.querySelector("div").append(dynamic);
      await settle(host);
      equal(new FormData(form).get("dynamic"), "Added", "deep dynamic child");
      for (let i = 0; i < 3; i++) { host.description = String(i); await settle(host); }
      equal(new FormData(form).get("dynamic"), "Added", "stable repeated updates");
      if (!nested) {
        dynamic.removeAttribute("form");
        await settle(host);
        equal(new FormData(form).get("dynamic"), "Added", "reclaim removed automatic association");
        dynamic.setAttribute("form", external.id);
        await settle(host);
        equal(new FormData(form).has("dynamic"), false, "changed explicit owner respected");
        equal(new FormData(external).get("dynamic"), "Added", "changed external association works");
        dynamic.setAttribute("form", "");
        await settle(host);
        equal(new FormData(form).has("dynamic"), false, "empty explicit association respected");
        dynamic.removeAttribute("form");
        await settle(host);
        equal(new FormData(form).get("dynamic"), "Added", "association restored after opt-in");
      }
      dynamic.remove();
      await settle(host);
      equal(new FormData(form).has("dynamic"), false, "removed child");
      equal(dynamic.hasAttribute("form"), false, "removed child association released");
      host.remove();
      document.body.append(host);
      await settle(host);
      equal([...new FormData(form)], [["native", "Native"], ["custom", "Cindor"]], "reconnected owner");
      equal(host.querySelectorAll("form").length, 1, "one owner after reconnect");
      host.remove();
      external.remove();
      return { initial, reset };
    }, nested);
    assert.deepEqual(result.initial, [["native", "Native"], ["custom", "Cindor"]], `${nested ? "nested" : "direct"} FormData`);
    assert.deepEqual(result.reset, [["native", "Native"], ["custom", "Cindor"]], `${nested ? "nested" : "direct"} reset`);

    // A real uncanceled GET submission must include the native submitter and its override.
    const request = page.waitForRequest((req) => req.url().includes("/submitted?"));
    await page.evaluate(async (nested) => {
      document.body.innerHTML += '<iframe name="submission-target"></iframe>';
      const host = document.createElement("cindor-form");
      const fields = '<input name="native" value="Native"><cindor-input name="custom" value="Cindor"></cindor-input><button type="submit" name="intent" value="save" formaction="/submitted">Save</button>';
      host.innerHTML = nested ? `<form action="/wrong" target="submission-target">${fields}</form>` : fields;
      host.setAttribute("action", "/wrong");
      host.setAttribute("target", "submission-target");
      document.body.append(host);
      await host.updateComplete;
      await host.querySelector("cindor-input").updateComplete;
      host.querySelector("button").click();
    }, nested);
    const submitted = new URL((await request).url());
    assert.equal(submitted.pathname, "/submitted");
    assert.deepEqual([...submitted.searchParams], [["native", "Native"], ["custom", "Cindor"], ["intent", "save"]]);
    await page.evaluate(() => { document.body.innerHTML = ""; });
  }
  await page.evaluate(async () => {
    const equal = (actual, expected, label) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(label);
    };
    const shell = document.createElement("div");
    const root = shell.attachShadow({ mode: "open" });
    const host = document.createElement("cindor-form");
    host.innerHTML = '<input name="direct" value="Direct">';
    root.append(host);
    document.body.append(shell);
    const settle = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); await host.updateComplete; };
    await settle();
    const directForm = host.querySelector("form");
    equal([...new FormData(directForm)], [["direct", "Direct"]], "ownership inside a shadow root");
    host.setAttribute("method", "post");
    host.setAttribute("action", "/updated");
    await settle();
    equal([directForm.method, directForm.getAttribute("action")], ["post", "/updated"], "dynamic native attributes");
    const nestedForm = document.createElement("form");
    nestedForm.innerHTML = '<input name="nested" value="Nested">';
    host.append(nestedForm);
    await settle();
    equal(host.querySelectorAll("form").length, 1, "switch to nested form removes native owner");
    equal(host.querySelector("input").hasAttribute("form"), false, "switch releases associations");
    nestedForm.remove();
    await settle();
    equal(host.querySelector("form") === directForm, true, "switch restores same native owner");
    equal([...new FormData(directForm)], [["direct", "Direct"]], "switch restores direct control values");
    shell.remove();
  });
  console.log("Native form ownership regression passed: direct/nested FormData, reset/cancellation, submitter, real GET, validation, external/disabled controls, dynamic children and reconnect.");
} finally {
  await browser?.close();
  await server.close();
}
