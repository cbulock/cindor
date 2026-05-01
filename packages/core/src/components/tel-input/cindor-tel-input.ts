import { BaseInputElement } from "../input/cindor-input.js";

export class CindorTelInput extends BaseInputElement {
  autocomplete = "tel";

  protected override get inputType(): string {
    return "tel";
  }
}
