import { BaseInputElement } from "../input/cindor-input.js";

export class CindorEmailInput extends BaseInputElement {
  autocomplete = "email";

  protected override get inputType(): string {
    return "email";
  }
}
