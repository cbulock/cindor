import { BaseInputElement } from "../input/emb-input.js";

export class EmbEmailInput extends BaseInputElement {
  autocomplete = "email";

  protected override get inputType(): string {
    return "email";
  }
}
