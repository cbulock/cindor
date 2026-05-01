import { BaseInputElement } from "../input/cindor-input.js";

export class CindorUrlInput extends BaseInputElement {
  autocomplete = "url";

  protected override get inputType(): string {
    return "url";
  }
}
