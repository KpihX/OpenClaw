#!/bin/bash
REPO_DIR="/home/kpihx/Work/AI/clawdbot"
CHECK_FILE="$HOME/.cache/openclaw-update-check"
INTERVAL=3600 # 1 heure

mkdir -p "$(dirname "$CHECK_FILE")"
NOW=$(date +%s)

# Fetch silencieux en arrière-plan depuis upstream si l'intervalle est dépassé
if [ ! -f "$CHECK_FILE" ] || [ $((NOW - $(stat -c %Y "$CHECK_FILE" 2>/dev/null || echo 0))) -gt $INTERVAL ]; then
    (cd "$REPO_DIR" && git fetch -q upstream main >/dev/null 2>&1) &
    touch "$CHECK_FILE"
fi

# Vérification du nombre de commits de retard par rapport à upstream
BEHIND=$(git -C "$REPO_DIR" rev-list HEAD..upstream/main --count 2>/dev/null)
if [ -n "$BEHIND" ] && [ "$BEHIND" -gt 0 ]; then
    printf "\n\033[1;33m🔔 OpenClaw : %s nouvelle(s) mise(s) à jour disponible(s) !\033[0m\n" "$BEHIND"
    printf "\033[0;36m👉 Run 'claw-up' for a stable update or 'claw-up -f' to force build from source.\033[0m\n\n"
fi
