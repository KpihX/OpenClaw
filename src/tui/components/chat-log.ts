import { Container, Spacer, Text } from "@mariozechner/pi-tui";
import { theme } from "../theme/theme.js";
import { AssistantMessageComponent } from "./assistant-message.js";
import { ToolExecutionComponent } from "./tool-execution.js";
import { UserMessageComponent } from "./user-message.js";

export class ChatLog extends Container {
  private toolById = new Map<string, ToolExecutionComponent>();
  private streamingRuns = new Map<string, AssistantMessageComponent>();
  private runTextOffsets = new Map<string, number>();
  private toolsExpanded = false;

  clearAll() {
    this.clear();
    this.toolById.clear();
    this.streamingRuns.clear();
    this.runTextOffsets.clear();
  }

  addSystem(text: string) {
    this.addChild(new Spacer(1));
    this.addChild(new Text(theme.system(text), 1, 0));
  }

  addUser(text: string) {
    this.addChild(new UserMessageComponent(text));
  }

  private resolveRunId(runId?: string) {
    return runId ?? "default";
  }

  startAssistant(text: string, runId?: string) {
    const effectiveRunId = this.resolveRunId(runId);
    const offset = this.runTextOffsets.get(effectiveRunId) ?? 0;
    const component = new AssistantMessageComponent(text.slice(offset));
    this.streamingRuns.set(effectiveRunId, component);
    this.addChild(component);
    return component;
  }

  updateAssistant(text: string, runId?: string) {
    const effectiveRunId = this.resolveRunId(runId);
    const existing = this.streamingRuns.get(effectiveRunId);
    const offset = this.runTextOffsets.get(effectiveRunId) ?? 0;
    if (!existing) {
      this.startAssistant(text, runId);
      return;
    }
    existing.setText(text.slice(offset));
  }

  finalizeAssistant(text: string, runId?: string) {
    const effectiveRunId = this.resolveRunId(runId);
    const existing = this.streamingRuns.get(effectiveRunId);
    const offset = this.runTextOffsets.get(effectiveRunId) ?? 0;
    if (existing) {
      existing.setText(text.slice(offset));
      this.streamingRuns.delete(effectiveRunId);
      this.runTextOffsets.delete(effectiveRunId);
      return;
    }
    this.addChild(new AssistantMessageComponent(text.slice(offset)));
  }

  startTool(
    toolCallId: string,
    toolName: string,
    args: unknown,
    runId?: string,
    currentFullText?: string,
  ) {
    const existing = this.toolById.get(toolCallId);
    if (existing) {
      existing.setArgs(args);
      return existing;
    }

    const effectiveRunId = this.resolveRunId(runId);

    // Capture the exact current text length as offset for the next segment.
    if (currentFullText) {
      this.runTextOffsets.set(effectiveRunId, currentFullText.length);
    }
    this.streamingRuns.delete(effectiveRunId);

    const component = new ToolExecutionComponent(toolName, args);
    component.setExpanded(this.toolsExpanded);
    this.toolById.set(toolCallId, component);
    this.addChild(component);

    return component;
  }

  updateToolArgs(toolCallId: string, args: unknown) {
    const existing = this.toolById.get(toolCallId);
    if (!existing) {
      return;
    }
    existing.setArgs(args);
  }

  updateToolResult(
    toolCallId: string,
    result: unknown,
    opts?: { isError?: boolean; partial?: boolean },
  ) {
    const existing = this.toolById.get(toolCallId);
    if (!existing) {
      return;
    }
    if (opts?.partial) {
      existing.setPartialResult(result as Record<string, unknown>);
      return;
    }
    existing.setResult(result as Record<string, unknown>, {
      isError: opts?.isError,
    });
  }

  setToolsExpanded(expanded: boolean) {
    this.toolsExpanded = expanded;
    for (const tool of this.toolById.values()) {
      tool.setExpanded(expanded);
    }
  }
}
