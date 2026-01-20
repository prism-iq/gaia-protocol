#!/bin/bash
# FLOW - Rebuild Script
# ./rebuild.sh                 # Full rebuild
# ./rebuild.sh --daemon        # Daemon only
# ./rebuild.sh --cli           # CLI only
# ./rebuild.sh --start         # Start daemon

set -e

FLOW_DIR="/root/flow-chat-phoenix"
DATA_DIR="$FLOW_DIR/.phoenix-data"
PORT=3666

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[FLOW]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
err() { echo -e "${RED}[ERR]${NC} $1"; }

# Ensure directories
mkdir -p "$DATA_DIR"
mkdir -p "$FLOW_DIR/src/systems/organs"
mkdir -p "$FLOW_DIR/src/systems/terminals"

# Build daemon
build_daemon() {
    log "Building daemon..."
    # flow-pure.js is the main daemon
    if [[ -f "$FLOW_DIR/src/systems/flow-pure.js" ]]; then
        ok "Daemon ready"
    else
        err "Daemon not found"
        exit 1
    fi
}

# Build CLI
build_cli() {
    log "Building CLI..."
    chmod +x /usr/local/bin/chimere 2>/dev/null || true
    ok "CLI ready"
}

# Start daemon
start_daemon() {
    log "Starting daemon..."

    # Kill existing
    pkill -f "flow-pure" 2>/dev/null || true
    rm -f "$DATA_DIR/flow.pid" 2>/dev/null || true
    sleep 1

    # Start
    cd "$FLOW_DIR"
    nohup node src/systems/flow-pure.js start > /dev/null 2>&1 &
    sleep 2

    # Check
    if curl -s "http://localhost:$PORT/status" > /dev/null 2>&1; then
        ok "Daemon running on port $PORT"
    else
        err "Daemon failed to start"
        cat "$DATA_DIR/flow.log" | tail -20
        exit 1
    fi
}

# Stop daemon
stop_daemon() {
    log "Stopping daemon..."
    pkill -f "flow-pure" 2>/dev/null || true
    rm -f "$DATA_DIR/flow.pid" 2>/dev/null || true
    ok "Daemon stopped"
}

# Status
status() {
    if curl -s "http://localhost:$PORT/status" > /dev/null 2>&1; then
        curl -s "http://localhost:$PORT/status" | head -20
        echo ""
        ok "Daemon is alive"
    else
        err "Daemon is not running"
    fi
}

# Main
case "${1:-all}" in
    --daemon)
        build_daemon
        ;;
    --cli)
        build_cli
        ;;
    --start)
        start_daemon
        ;;
    --stop)
        stop_daemon
        ;;
    --restart)
        stop_daemon
        start_daemon
        ;;
    --status)
        status
        ;;
    all|--all)
        build_daemon
        build_cli
        stop_daemon
        start_daemon
        ;;
    *)
        echo "Usage: $0 [--daemon|--cli|--start|--stop|--restart|--status|--all]"
        ;;
esac
