import { generateSummary } from "@mariozechner/pi-coding-agent";
import { resolveDefaultAgentId } from "../../agents/agent-scope.js";
import { getApiKeyForModel } from "../../agents/model-auth.js";
import { resolveModel } from "../../agents/pi-embedded-runner/model.js";
import { loadConfig } from "../../config/config.js";
import { type SessionEntry, updateSessionStoreEntry } from "../../config/sessions.js";
import { readSessionMessages } from "../../gateway/session-utils.fs.js";

export async function autoSummarizeSession(params: {
  sessionKey: string;
  storePath: string;
  entry: SessionEntry;
}): Promise<void> {
  const { sessionKey, storePath, entry } = params;

  // Skip if already has a summary or display name
  if (entry.summary || entry.displayName) {
    return;
  }

  const cfg = loadConfig();
  const messages = readSessionMessages(entry.sessionId, storePath, entry.sessionFile);

  // Need at least 2 messages (user + assistant) to summarize
  if (messages.length < 2) {
    return;
  }

  try {
    const agentId = resolveDefaultAgentId(cfg);
    const modelRef = entry.model ?? cfg.agents?.defaults?.model?.primary ?? "openai/gpt-4o";
    const [provider, modelId] = modelRef.split("/");

    const resolved = resolveModel(provider, modelId, undefined, cfg);
    if (!resolved.model) {
      return;
    }

    const apiKey = await getApiKeyForModel({
      model: resolved.model,
      cfg: cfg,
    });

    if (!apiKey?.apiKey) {
      return;
    }

    const summary = await generateSummary(
      messages as any,
      resolved.model,
      1000,
      apiKey.apiKey,
      new AbortController().signal,
      "Generate a very short, one-sentence summary of what this conversation is about (max 10 words). This will be used as the session title.",
    );

    if (summary) {
      await updateSessionStoreEntry({
        storePath,
        sessionKey,
        update: async () => ({
          summary: summary.trim(),
          updatedAt: Date.now(),
        }),
      });
    }
  } catch (err) {
    // Silent fail for auto-summary
  }
}
