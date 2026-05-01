import { EmbTabs } from "./emb-tabs.js";

type TabsStoryArgs = {
  activityLabel: string;
  activityText: string;
  overviewLabel: string;
  overviewText: string;
  settingsLabel: string;
  settingsText: string;
  value: string;
};

const meta = {
  title: "Components/Tabs",
  args: {
    activityLabel: "Activity",
    activityText: "Activity content",
    overviewLabel: "Overview",
    overviewText: "Overview content",
    settingsLabel: "Settings",
    settingsText: "Settings content",
    value: "overview"
  },
  argTypes: {
    value: {
      control: { type: "radio" },
      options: ["overview", "activity", "settings"]
    }
  },
  render: ({ activityLabel, activityText, overviewLabel, overviewText, settingsLabel, settingsText, value }: TabsStoryArgs) => {
    const element = document.createElement("emb-tabs") as EmbTabs;
    element.setAttribute("aria-label", "Project sections");
    element.value = value;
    element.addEventListener("change", (event) => {
      event.stopPropagation();
    });

    const panels = [
      { label: overviewLabel, text: overviewText, value: "overview" },
      { label: activityLabel, text: activityText, value: "activity" },
      { label: settingsLabel, text: settingsText, value: "settings" }
    ];

    for (const panel of panels) {
      const section = document.createElement("emb-tab-panel");
      section.setAttribute("label", panel.label);
      section.setAttribute("value", panel.value);
      section.textContent = panel.text;
      element.append(section);
    }

    return element;
  }
};

export default meta;

export const Default = {};

export const Activity = {
  args: {
    value: "activity"
  }
};
