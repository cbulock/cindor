import { BaseInputElement } from "../input/emb-input.js";

export class EmbUrlInput extends BaseInputElement {
  autocomplete = "url";

  protected override get inputType(): string {
    return "url";
  }
}
