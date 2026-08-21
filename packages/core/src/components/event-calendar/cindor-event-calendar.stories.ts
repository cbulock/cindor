import { html } from "lit";

import type { EventCalendarEvent } from "./cindor-event-calendar.js";

type EventCalendarStoryArgs = {
  emptyMessage: string;
  month: string;
  value: string;
};

const events: EventCalendarEvent[] = [
  {
    date: "2026-04-08",
    description: "Lock release notes and confirm approvers.",
    id: "release-freeze",
    time: "09:00",
    title: "Release freeze",
    tone: "warning"
  },
  {
    date: "2026-04-08",
    description: "Walk through blockers with design and support.",
    id: "launch-standup",
    time: "11:00",
    title: "Launch standup",
    tone: "accent"
  },
  {
    date: "2026-04-08",
    description: "Run the final smoke pass before sign-off.",
    id: "smoke-check",
    time: "15:30",
    title: "Smoke check",
    tone: "success"
  },
  {
    date: "2026-04-14",
    description: "Ship the onboarding walkthrough to production.",
    id: "launch-day",
    time: "10:00",
    title: "Launch day",
    tone: "accent"
  },
  {
    date: "2026-04-16",
    endDate: "2026-04-18",
    description: "Share a staffed coverage calendar for the offsite.",
    id: "team-offsite",
    title: "Team offsite",
    tone: "neutral"
  },
  {
    date: "2026-04-23",
    description: "Review conversion data and follow-up actions.",
    id: "retro",
    time: "13:30",
    title: "Launch retrospective",
    tone: "danger"
  }
];

const meta = {
  title: "Components/Event Calendar",
  args: {
    emptyMessage: "Nothing is scheduled for this day yet.",
    month: "2026-04",
    value: "2026-04-08"
  },
  render: ({ emptyMessage, month, value }: EventCalendarStoryArgs) => html`
    <cindor-event-calendar
      aria-label="Launch calendar"
      empty-message=${emptyMessage}
      month=${month}
      value=${value}
      .events=${events}
    ></cindor-event-calendar>
  `
};

export default meta;

export const Default = {};
