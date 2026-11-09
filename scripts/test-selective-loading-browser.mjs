/* global window, document, customElements */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const consumer = path.join(root, ".tmp/selective-consumer");
const outdir = path.join(consumer, "dist/browser");
await build({
  stdin: { resolveDir: consumer, contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { createApp, h } from 'vue';
    import { CindorDateTimePicker } from 'cindor-ui-react/components/date-time-picker';
    import { CindorButton } from 'cindor-ui-vue/components/button';
    import 'cindor-ui-core/register/icon';
    import { CindorIcon } from 'cindor-ui-core';
    window.initialTags = [...window.registeredTags];
    window.iconClass = CindorIcon;
    window.loadAll = () => import('cindor-ui-core/register');
    createRoot(document.querySelector('#react')).render(React.createElement(CindorDateTimePicker));
    createApp({ render: () => h(CindorButton, {}, () => 'Selective button') }).mount('#vue');
  ` },
  bundle: true, splitting: true, format: "esm", platform: "browser", outdir,
  tsconfigRaw: {}, minify: true, define: { "process.env.NODE_ENV": '"production"' }
});
const inheritedInputs = ["search", "email-input", "date-input", "number-input", "tel-input", "time-input", "url-input", "password-input", "input"];
for (const slug of inheritedInputs) {
  await build({
    stdin: { resolveDir: consumer, contents: `
      import 'cindor-ui-core/register/${slug}';
      const input = document.createElement('cindor-${slug}');
      input.startIcon = 'alarm-clock';
      document.body.append(input);
      window.inheritedReady = true;
    ` },
    bundle: true, splitting: true, format: "esm", platform: "browser", outdir,
    entryNames: "inherited-" + slug, tsconfigRaw: {}, minify: true
  });
}
// Build HTML only from trusted fixture names, before handling any requests.
const fixturePages = new Map(["", ...inheritedInputs].map(slug => [
  slug ? `/?input=${slug}` : "/",
  `<div id="react"></div><div id="vue"></div><script>
      window.registeredTags = [];
      const define = customElements.define.bind(customElements);
      customElements.define = (name, constructor, options) => { window.registeredTags.push(name); define(name, constructor, options); };
    </script><script type="module" src="/${slug ? "inherited-" + slug : "stdin"}.js"></script>`
]));
const server = createServer(async (req, res) => {
  const fixturePage = fixturePages.get(req.url);
  if (fixturePage !== undefined) {
    res.setHeader("Content-Type", "text/html");
    res.end(fixturePage);
    return;
  }
  try {
    res.setHeader("Content-Type", "text/javascript");
    res.end(await readFile(path.join(outdir, path.basename(req.url))));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true, ...(process.env.CINDOR_CHROME_PATH ? { executablePath: process.env.CINDOR_CHROME_PATH } : {}) });
try {
  for (const requestPath of ["/unexpected?input=search", "/?input=unknown", `/?input=${encodeURIComponent('"><script>alert(1)</script>')}`]) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${requestPath}`);
    assert.equal(response.status, 404, "unexpected fixture URLs must be rejected");
    assert.equal(await response.text(), "", "rejected requests must not reflect request data");
  }
  for (const slug of inheritedInputs) {
    const inheritedPage = await browser.newPage();
    inheritedPage.setDefaultTimeout(15000);
    await inheritedPage.goto(`http://127.0.0.1:${server.address().port}/?input=${slug}`);
    await inheritedPage.waitForFunction(() => window.inheritedReady);
    assert.deepEqual(await inheritedPage.evaluate(() => window.registeredTags.sort()),
      [`cindor-${slug}`, "cindor-icon"].sort(), `${slug} must register inherited icons without unrelated elements`);
    await inheritedPage.waitForFunction(tag => {
      const input = document.querySelector(tag);
      const icons = input?.shadowRoot?.querySelectorAll('cindor-icon');
      return icons?.length && Array.from(icons).every(icon => icon.shadowRoot?.querySelector('svg'));
    }, `cindor-${slug}`);
    await inheritedPage.close();
  }
  console.log('Built-package browser: all nine inherited input icon registrations and rendering passed in isolated pages.');
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => document.querySelector('cindor-button')?.shadowRoot?.querySelector('button'));
  const tags = await page.evaluate(() => window.initialTags.sort());
  assert.deepEqual(tags, ["calendar", "date-picker", "date-time-picker", "icon", "icon-button", "time-input", "button"].map(slug => `cindor-${slug}`).sort());
  await page.waitForFunction(() => {
    const picker = document.querySelector('cindor-date-time-picker');
    return picker?.shadowRoot?.querySelector('cindor-date-picker')?.shadowRoot?.querySelector('cindor-icon-button')?.shadowRoot?.querySelector('cindor-icon')?.shadowRoot?.querySelector('svg');
  });
  await page.evaluate(() => {
    const icon = document.createElement('cindor-icon');
    icon.id = 'custom-icon';
    icon.name = 'AlarmClock';
    document.body.append(icon);
  });
  await page.waitForFunction(() => document.querySelector('#custom-icon')?.shadowRoot?.querySelector('svg'));
  await page.evaluate(async () => {
    const before = customElements.get('cindor-icon');
    await window.loadAll();
    if (before !== window.iconClass || before !== customElements.get('cindor-icon')) throw new Error('Constructor identity changed');
    const icon = document.querySelector('#custom-icon');
    icon.name = 'not-a-real-icon';
  });
  await page.waitForFunction(() => !document.querySelector('#custom-icon')?.shadowRoot?.querySelector('svg'));
  assert.deepEqual(errors, []);
  console.log('Built-package browser: selective React/Vue render, transitive registration, built-in/arbitrary/missing icons, and register-all identity passed.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
