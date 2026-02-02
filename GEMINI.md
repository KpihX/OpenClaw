# OpenClaw Fork Context: KpihX Edition

## 📌 Fork Overview
This repository is a heavily customized fork of [OpenClaw](https://github.com/clawdbot/clawdbot). It has been optimized for high-end R&D (Lokad PSC project), specifically targeting **Applied Math**, **Agentic AI**, and **Advanced Tool Interleaving**.

## 🔄 Remote & Update Strategy
- **`upstream`**: Official OpenClaw repository. Used for stability updates.
- **`origin`**: Personal GitHub (`git@github.com:KpihX/OpenClaw.git`). Current active development branch.
- **`claw-up -f`**: Use this command to force-merge upstream changes and rebuild.
- **⚠️ Merge Warning**: Several core files have "hardcoded" logic to bypass official restrictions. See *UI & Streaming Fixes* below.

## 🚀 Execution Environment (Node 22 Mandatory)
OpenClaw requires Node >= 22. To ensure compatibility across all execution contexts (TUI, Daemon, and AI-triggered `exec` tools):

### 1. Shell Configuration (`~/.kshrc`)
The `openclaw` function is wrapped to use the NVM Node v22 binaire explicitly:
```bash
openclaw () {
    /home/kpihx/.nvm/versions/node/v22.21.1/bin/node /home/kpihx/Work/AI/clawdbot/openclaw.mjs "$@"
}
```

### 2. Tool Compatibility Wrappers
To prevent AI tools from failing with "Node 20 detected", symlinks and wrappers are installed in `~/.local/bin/` (which has priority in `PATH`):
- `~/.local/bin/node` -> Pointing to Node v22.
- `~/.local/bin/openclaw` -> Wrapper script calling the local fork with Node v22.

## 🎨 UI Customizations & Rich Rendering

### 1. Persistent TUI State
- **Config-Driven**: `toolsExpanded` and `showThinking` are now part of the `ui` schema in `openclaw.json`.
- **Default**: Tools are **expanded by default** (`true`) in `src/tui/tui.ts`.
- **Files involved**: `src/config/zod-schema.ts`, `src/config/types.openclaw.ts`, `src/tui/tui.ts`.

### 2. Natural Order Interleaving (The "Rich" Experience)
- **Chronological Flow**: Assistant text and Tool outputs are now interleaved in the TUI instead of tools being appended at the end.
- **Robust Safe-Breaking**: Implemented logic in `ChatLog` to split assistant messages at the exact point an tool is called.
- **Precision Fix**: Removed destructive `.trim()` calls in `src/tui/tui-formatters.ts` to ensure character-perfect text offsets and prevent "word eating" (e.g., no more "nfiguratio...").
- **Files involved**: `src/tui/components/chat-log.ts`, `src/tui/tui-event-handlers.ts`, `src/tui/tui-formatters.ts`.

## ⚙️ Server-Side & Gateway Fixes

### 1. Live Tool Output Streaming
- **The Problem**: Official OpenClaw suppressed tool output events unless verbosity was exactly "on".
- **The Fix**: Hard-forced `true` for tool emission in:
    - `src/auto-reply/reply/agent-runner-helpers.ts` (Server level).
    - `src/gateway/server-chat.ts` (Gateway/WebSocket level).
- **Outcome**: Every tool execution is visible in real-time in the TUI.

### 2. Automatic Session Summarization
- **Feature**: Sessions without titles now get an automatic, model-generated one-sentence summary at the end of each run.
- **Storage**: Summary is saved in `SessionEntry.summary` and displayed in the `/sessions` picker.
- **Files involved**: `src/auto-reply/reply/auto-summarize.ts` (New), `src/auto-reply/reply/agent-runner.ts`.

## 🍔 Specific Integrations

### Deliveroo (ordercli)
- **Auth**: Authenticated via `DELIVEROO_BEARER_TOKEN` stored in `openclaw.json` under `env.vars`.
- **Market**: Configured for `uk` market to match current session tokens.

### Telegram Bot
- **User ID**: `1397540599`.
- **Policy**: `pairing` enabled for high security.

## 🛡️ Maintenance Commands
- **Restart Daemon**: `pkill -f openclaw && openclaw daemon start` (Mandatory after `dist/` changes).
- **Check Logs**: TUI logs events to `/tmp/openclaw-tui.log` if debug mode is reactivated.
- **Doctor**: `openclaw doctor --fix` to sync systemd services with the local Node v22 path.

## 📈 Version History & Significant Merges

### 2026.2.1 Upstream Update (Feb 2, 2026)
Successfully merged official version 2026.2.1.
- **Specific Fixes Applied**:
    - **System Prompt**: Corrected `createSystemPromptOverride` in `src/agents/pi-embedded-runner/system-prompt.ts` to return a function instead of a string (fixing a breaking regression in upstream).
    - **Tool Adapters**: Updated `src/agents/pi-tool-definition-adapter.ts` to match the new `execute` signature from `@mariozechner/pi-coding-agent`.
- **Status**: Stable and building.