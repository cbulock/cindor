import { BaseInputElement } from "../input/emb-input.js";

export class EmbSearch extends BaseInputElement {
  startIcon = "search";

  protected override get inputType(): string {
    return "search";
  }
}
