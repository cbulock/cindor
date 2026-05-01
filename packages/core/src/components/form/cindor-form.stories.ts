import { html } from "lit";

type FormStoryArgs = {
  description: string;
  error: string;
  submitting: boolean;
  success: string;
};

const meta = {
  title: "Components/Form",
  args: {
    description: "Compose validation, layout, and submission feedback around a slotted native form.",
    error: "",
    submitting: false,
    success: ""
  },
  render: ({ description, error, submitting, success }: FormStoryArgs) => html`
    <cindor-form description=${description} error=${error} ?submitting=${submitting} success=${success}>
      <form @submit=${(event: Event) => event.preventDefault()}>
        <cindor-form-row>
          <cindor-form-field label="Project name" description="Shown in workspace navigation." required>
            <cindor-input name="projectName" placeholder="Cindor Docs" required></cindor-input>
          </cindor-form-field>
          <cindor-form-field label="Owner email" description="Used for launch notifications." required>
            <cindor-email-input name="ownerEmail" placeholder="owner@example.com" required></cindor-email-input>
          </cindor-form-field>
        </cindor-form-row>
        <cindor-fieldset legend="Notifications">
          <cindor-checkbox name="notifyComments" checked>Comments</cindor-checkbox>
          <cindor-checkbox name="notifyLaunch">Launch status</cindor-checkbox>
        </cindor-fieldset>
        <cindor-button-group attached>
          <cindor-button type="reset" variant="ghost">Reset</cindor-button>
          <cindor-button type="submit">Create project</cindor-button>
        </cindor-button-group>
      </form>
    </cindor-form>
  `
};

export default meta;

export const Default = {};

export const Submitting = {
  args: {
    submitting: true
  }
};

export const WithStatus = {
  args: {
    success: "Project settings saved."
  }
};
