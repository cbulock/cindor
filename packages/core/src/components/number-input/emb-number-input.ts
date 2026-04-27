import { BaseInputElement } from "../input/emb-input.js";

export class EmbNumberInput extends BaseInputElement {
  protected override get inputType(): string {
    return "number";
  }
}
