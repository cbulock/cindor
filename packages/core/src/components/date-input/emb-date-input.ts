import { BaseInputElement } from "../input/emb-input.js";

export class EmbDateInput extends BaseInputElement {
  protected override get inputType(): string {
    return "date";
  }
}
