import { BaseInputElement } from "../input/cindor-input.js";

export class CindorSearch extends BaseInputElement {
  endIcon = "search";

  protected override get inputType(): string {
    return "search";
  }
}
