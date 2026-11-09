import { expect } from "storybook/test";

import type { CindorDatePicker } from "../date-picker/cindor-date-picker.js";
import type { CindorDateTimePicker } from "./cindor-date-time-picker.js";

const meta = {
  title: "Forms/Date Time Picker",
  render: () => `<cindor-date-time-picker aria-label="Launch time" value="2026-04-28T09:30"></cindor-date-time-picker>`
};

export default meta;

export const Default = {};

export const Required = {
  render: () => `
    <form>
      <cindor-date-time-picker aria-label="Launch time" name="launch" required></cindor-date-time-picker>
      <button type="submit">Schedule launch</button>
    </form>
  `,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const form = canvasElement.querySelector("form")!;
    const host = form.querySelector<CindorDateTimePicker>("cindor-date-time-picker")!;
    await host.updateComplete;
    const date = host.renderRoot.querySelector<CindorDatePicker>("cindor-date-picker")!;
    await date.updateComplete;
    const input = date.shadowRoot!.querySelector("input")!;
    form.addEventListener("submit", (event) => event.preventDefault(), { once: true });
    form.requestSubmit();
    await expect(date.shadowRoot!.activeElement).toBe(input);
    input.blur();
  }
};
