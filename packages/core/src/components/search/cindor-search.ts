import { BaseInputElement } from "../input/cindor-input.js";

export class CindorSearch extends BaseInputElement {
  startIcon = "search";

  protected override get inputType(): string {
    return "search";
  }
}
