import { BaseInputElement } from "../input/cindor-input.js";

export class CindorDateInput extends BaseInputElement {
  protected override get inputType(): string {
    return "date";
  }
}
