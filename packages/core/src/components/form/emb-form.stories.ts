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
    <emb-form description=${description} error=${error} ?submitting=${submitting} success=${success}>
      <form @submit=${(event: Event) => event.preventDefault()}>
        <emb-form-row>
          <emb-form-field label="Project name" description="Shown in workspace navigation." required>
            <emb-input name="projectName" placeholder="Emberline Docs" required></emb-input>
          </emb-form-field>
          <emb-form-field label="Owner email" description="Used for launch notifications." required>
            <emb-email-input name="ownerEmail" placeholder="owner@example.com" required></emb-email-input>
          </emb-form-field>
        </emb-form-row>
        <emb-fieldset legend="Notifications">
          <emb-checkbox name="notifyComments" checked>Comments</emb-checkbox>
          <emb-checkbox name="notifyLaunch">Launch status</emb-checkbox>
        </emb-fieldset>
        <emb-button-group attached>
          <emb-button type="reset" variant="ghost">Reset</emb-button>
          <emb-button type="submit">Create project</emb-button>
        </emb-button-group>
      </form>
    </emb-form>
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
