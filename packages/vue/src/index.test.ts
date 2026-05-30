import { createApp, defineComponent, h, nextTick } from "vue";

import type { App } from "vue";

import { CindorAutocomplete, CindorBanner } from "./index";

describe("cindor-ui-vue", () => {
  let container: HTMLDivElement | null = null;
  let app: App<Element> | null = null;

  afterEach(() => {
    app?.unmount();
    app = null;
    container?.remove();
    container = null;
  });

  it("preserves structured props and emits update:modelValue from autocomplete", async () => {
    const onModelUpdate = vi.fn();
    const suggestions = [{ label: "Alpha" }, { label: "Beta" }];

    mount((modelValue) =>
      h(CindorAutocomplete, {
        modelValue,
        suggestions,
        "onUpdate:modelValue": onModelUpdate
      })
    );

    const element = await queryElement<HTMLElement & { suggestions: typeof suggestions; value: string }>("cindor-autocomplete");
    expect(element.suggestions).toEqual(suggestions);

    element.value = "Beta";
    element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await nextTick();

    expect(onModelUpdate).toHaveBeenCalledWith("Beta");
  });

  it("emits update:open from banner open-change events", async () => {
    const onOpenUpdate = vi.fn();

    mount((modelValue) =>
      h(CindorBanner, {
        open: modelValue !== "closed",
        "onUpdate:open": onOpenUpdate
      })
    );

    const element = await queryElement<HTMLElement>("cindor-banner");
    element.dispatchEvent(new CustomEvent("open-change", { bubbles: true, composed: true, detail: { open: false } }));
    await nextTick();

    expect(onOpenUpdate).toHaveBeenCalledWith(false);
  });

  function mount(renderWrapper: (modelValue: string) => ReturnType<typeof h>) {
    container = document.createElement("div");
    document.body.append(container);

    app = createApp(
      defineComponent({
        data: () => ({
          modelValue: ""
        }),
        render() {
          return renderWrapper(this.modelValue);
        }
      })
    );

    app.mount(container);
  }
});

async function queryElement<T extends Element>(selector: string): Promise<T> {
  await nextTick();
  const element = document.body.querySelector(selector);

  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  return element as T;
}
