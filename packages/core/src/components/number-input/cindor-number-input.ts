import { BaseInputElement } from "../input/cindor-input.js";

export class CindorNumberInput extends BaseInputElement {
  protected override get inputType(): string {
    return "number";
  }
}
