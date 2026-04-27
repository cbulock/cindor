import { EmbChip } from "../chip/emb-chip.js";

export class EmbTag extends EmbChip {
  override connectedCallback(): void {
    if (!this.hasAttribute("tone")) {
      this.tone = "accent";
    }

    super.connectedCallback();
  }
}
