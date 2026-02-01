#!/bin/bash
# 🚀 Force Update Script for OpenClaw
# This script performs a manual git pull, pnpm install, and build.

REPO_DIR="/home/kpihx/Work/AI/clawdbot"

echo "➡️  Starting manual force update in $REPO_DIR..."

cd "$REPO_DIR" || exit 1

# 1. Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull

# 2. Install dependencies
# Using --ignore-scripts to avoid EACCES issues with completion scripts during automated runs
echo "📦 Installing dependencies..."
pnpm install --ignore-scripts

# 3. Build project
echo "🏗️  Building project..."
pnpm build

# 4. Restart Daemon
echo "🔄 Restarting OpenClaw daemon..."
openclaw daemon restart

echo "✅ Force update completed successfully!"
