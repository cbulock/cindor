import { BaseInputElement } from "../input/emb-input.js";

export class EmbTelInput extends BaseInputElement {
  autocomplete = "tel";

  protected override get inputType(): string {
    return "tel";
  }
}
