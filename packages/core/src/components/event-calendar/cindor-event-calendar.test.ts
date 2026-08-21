import "../../register.js";

import { CindorEventCalendar, type EventCalendarEvent } from "./cindor-event-calendar.js";

describe("cindor-event-calendar", () => {
  const events: EventCalendarEvent[] = [
    {
      date: "2026-04-08",
      id: "release-freeze",
      time: "09:00",
      title: "Release freeze",
      tone: "warning"
    },
    {
      date: "2026-04-08",
      id: "launch-standup",
      time: "11:00",
      title: "Launch standup",
      tone: "accent"
    },
    {
      date: "2026-04-08",
      id: "smoke-check",
      time: "15:30",
      title: "Smoke check",
      tone: "success"
    },
    {
      date: "2026-04-16",
      endDate: "2026-04-18",
      id: "team-offsite",
      title: "Team offsite"
    }
  ];

  it("renders agenda items for the selected day", async () => {
    const element = document.createElement("cindor-event-calendar") as CindorEventCalendar;
    element.events = events;
    element.month = "2026-04";
    element.value = "2026-04-08";
    document.body.append(element);
    await element.updateComplete;

    const agendaTitles = Array.from(element.renderRoot.querySelectorAll(".agenda-event-title")).map((node) => node.textContent?.trim());

    expect(agendaTitles).toEqual(["Release freeze", "Launch standup", "Smoke check"]);
    expect(element.renderRoot.querySelector(".agenda-title")?.textContent).toContain("2026");
  });

  it("updates the selected date and emits value events when a day is clicked", async () => {
    const element = document.createElement("cindor-event-calendar") as CindorEventCalendar;
    element.events = events;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    const onInput = vi.fn();
    const onChange = vi.fn();
    element.addEventListener("input", onInput);
    element.addEventListener("change", onChange);

    const targetDay = Array.from(element.renderRoot.querySelectorAll(".day")).find(
      (button) => (button as HTMLButtonElement).value === "2026-04-08"
    ) as HTMLButtonElement | undefined;

    targetDay?.click();
    await element.updateComplete;

    expect(element.value).toBe("2026-04-08");
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("shows an overflow indicator when a day has more than two events", async () => {
    const element = document.createElement("cindor-event-calendar") as CindorEventCalendar;
    element.events = events;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    const targetDay = Array.from(element.renderRoot.querySelectorAll(".day")).find(
      (button) => (button as HTMLButtonElement).value === "2026-04-08"
    ) as HTMLButtonElement | undefined;

    expect(targetDay?.textContent).toContain("+1 more");
  });

  it("includes spanning events on each covered day", async () => {
    const element = document.createElement("cindor-event-calendar") as CindorEventCalendar;
    element.events = events;
    element.month = "2026-04";
    element.value = "2026-04-17";
    document.body.append(element);
    await element.updateComplete;

    const agendaTitles = Array.from(element.renderRoot.querySelectorAll(".agenda-event-title")).map((node) => node.textContent?.trim());

    expect(agendaTitles).toContain("Team offsite");
  });

  it("navigates between months and keeps the header in sync", async () => {
    const element = document.createElement("cindor-event-calendar") as CindorEventCalendar;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;
    const initialHeader = element.renderRoot.querySelector('[part="month"]')?.textContent;

    const previousButton = element.renderRoot.querySelector('[part="previous-button"]') as HTMLElement;
    previousButton.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.month).toBe("2026-03");
    expect(element.renderRoot.querySelector('[part="month"]')?.textContent).not.toBe(initialHeader);
  });

  it("emits event-select details for agenda interactions", async () => {
    const element = document.createElement("cindor-event-calendar") as CindorEventCalendar;
    element.events = events;
    element.month = "2026-04";
    element.value = "2026-04-08";
    document.body.append(element);
    await element.updateComplete;

    const onEventSelect = vi.fn();
    element.addEventListener("event-select", onEventSelect);

    const agendaButton = element.renderRoot.querySelector(".agenda-event") as HTMLButtonElement;
    agendaButton.click();

    expect(onEventSelect).toHaveBeenCalledTimes(1);
    expect(onEventSelect.mock.calls[0][0].detail).toMatchObject({
      date: "2026-04-08",
      event: {
        id: "release-freeze"
      }
    });
  });
});
