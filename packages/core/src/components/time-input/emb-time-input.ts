import { BaseInputElement } from "../input/emb-input.js";

export class EmbTimeInput extends BaseInputElement {
  protected override get inputType(): string {
    return "time";
  }
}
