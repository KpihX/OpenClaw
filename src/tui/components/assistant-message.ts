import { Container, Markdown, Spacer } from "@mariozechner/pi-tui";
import { markdownTheme, theme } from "../theme/theme.js";

export class AssistantMessageComponent extends Container {
  private body: Markdown;
  private currentText: string;

  constructor(text: string) {
    super();
    this.currentText = text;
    this.body = new Markdown(text, 1, 0, markdownTheme, {
      color: (line) => theme.fg(line),
    });
    this.addChild(new Spacer(1));
    this.addChild(this.body);
  }

  setText(text: string) {
    this.currentText = text;
    this.body.setText(text);
  }

  getText(): string {
    return this.currentText;
  }
}
