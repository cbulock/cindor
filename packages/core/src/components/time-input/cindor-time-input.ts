import { BaseInputElement } from "../input/cindor-input.js";

export class CindorTimeInput extends BaseInputElement {
  protected override get inputType(): string {
    return "time";
  }
}
